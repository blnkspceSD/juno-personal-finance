/**
 * Category Service
 * Handles category usage analytics and intelligent suggestions
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  Category, 
  CategorySuggestion, 
  CategorySuggestionGroup,
  CategoryUsage,
  RecentCategories,
  CategoryKeywords,
  CategoryAmountPatterns,
  CategoryTimePatterns
} from '@/lib/types/database'

export class CategoryService {
  private supabase = createClient()

  /**
   * Get category suggestions for a user based on various factors
   */
  async getCategorySuggestions(
    userId: string,
    description?: string,
    amount?: number,
    date?: Date
  ): Promise<CategorySuggestionGroup[]> {
    try {
      const [
        categories,
        frequentSuggestions,
        recentSuggestions,
        descriptionSuggestions,
        amountSuggestions,
        timeSuggestions
      ] = await Promise.all([
        this.getAllCategories(userId),
        this.getFrequentCategories(userId),
        this.getRecentCategories(userId),
        description ? this.getDescriptionBasedSuggestions(userId, description) : [],
        amount ? this.getAmountBasedSuggestions(userId, amount) : [],
        date ? this.getTimeBasedSuggestions(userId, date) : []
      ])

      const categoryMap = new Map(categories.map(c => [c.id, c]))

      const groups: CategorySuggestionGroup[] = []

      // AI/Smart Suggestions (highest priority)
      const smartSuggestions = this.combineSmartSuggestions(
        descriptionSuggestions,
        amountSuggestions,
        timeSuggestions,
        categoryMap
      )
      if (smartSuggestions.length > 0) {
        groups.push({
          title: 'Smart Suggestions',
          categories: smartSuggestions,
          priority: 100,
          max_display: 3
        })
      }

      // Recent Categories
      if (recentSuggestions.length > 0) {
        groups.push({
          title: 'Recent',
          categories: recentSuggestions.map(cat => ({
            category_id: cat.id,
            category_name: cat.name,
            confidence_score: 0.8,
            reasoning: ['Recently used'],
            suggestion_type: 'recent' as const,
            icon: '🕒'
          })),
          priority: 90,
          max_display: 5
        })
      }

      // Frequent Categories
      if (frequentSuggestions.length > 0) {
        groups.push({
          title: 'Frequent',
          categories: frequentSuggestions,
          priority: 80,
          max_display: 5
        })
      }

      // All Categories (fallback)
      groups.push({
        title: 'All Categories',
        categories: categories.map(cat => ({
          category_id: cat.id,
          category_name: cat.name,
          confidence_score: 0.1,
          reasoning: ['Available category'],
          suggestion_type: 'frequent' as const
        })),
        priority: 10,
        max_display: -1 // No limit
      })

      return groups

    } catch (error) {
      console.error('Error getting category suggestions:', error)
      return []
    }
  }

  /**
   * Get all categories for a user
   */
  private async getAllCategories(userId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      return []
    }

    return data || []
  }

  /**
   * Get frequently used categories based on usage statistics
   */
  private async getFrequentCategories(userId: string): Promise<CategorySuggestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('category_usage')
        .select(`
          *,
          categories!inner(id, name)
        `)
        .eq('user_id', userId)
        .order('usage_count', { ascending: false })
        .order('weekly_frequency', { ascending: false })
        .limit(10)

      if (error) {
        // Table doesn't exist yet - migration hasn't been run
        if (error.code === '42P01') {
          return []
        }
        console.error('Error fetching frequent categories:', error)
        return []
      }

      return (data || []).map(usage => ({
        category_id: usage.categories.id,
        category_name: usage.categories.name,
        confidence_score: this.calculateFrequencyScore(usage),
        reasoning: [
          `Used ${usage.usage_count} times`,
          `${usage.weekly_frequency.toFixed(1)} times/week`
        ],
        suggestion_type: 'frequent' as const,
        badge: usage.usage_count > 10 ? 'popular' as const : undefined
      }))
    } catch (error) {
      console.error('Error in getFrequentCategories:', error)
      return []
    }
  }

  /**
   * Get recently used categories
   */
  private async getRecentCategories(userId: string): Promise<Category[]> {
    try {
      const { data, error } = await this.supabase
        .from('recent_categories')
        .select('category_ids')
        .eq('user_id', userId)
        .single()

      if (error) {
        // Table doesn't exist yet - migration hasn't been run
        if (error.code === '42P01') {
          return []
        }
        return []
      }

      if (!data?.category_ids?.length) {
        return []
      }

      // Fetch category details for recent category IDs
      const { data: categories, error: categoriesError } = await this.supabase
        .from('categories')
        .select('*')
        .in('id', data.category_ids)

      if (categoriesError) {
        console.error('Error fetching recent categories:', categoriesError)
        return []
      }

      // Maintain order from recent_categories array
      const categoryMap = new Map((categories || []).map(c => [c.id, c]))
      return data.category_ids
        .map(id => categoryMap.get(id))
        .filter(Boolean) as Category[]
    } catch (error) {
      console.error('Error in getRecentCategories:', error)
      return []
    }
  }

  /**
   * Get description-based category suggestions using keywords
   */
  private async getDescriptionBasedSuggestions(
    userId: string,
    description: string
  ): Promise<CategorySuggestion[]> {
    try {
      const descriptionLower = description.toLowerCase()
      const words = descriptionLower.split(/\s+/).filter(word => word.length > 2)

      if (words.length === 0) return []

      const { data, error } = await this.supabase
        .from('category_keywords')
        .select(`
          *,
          categories!inner(id, name)
        `)
        .or(`user_id.eq.${userId},user_id.is.null`)

      if (error) {
        // Table doesn't exist yet - migration hasn't been run
        if (error.code === '42P01') {
          return []
        }
        console.error('Error fetching category keywords:', error)
        return []
      }

    const suggestions: CategorySuggestion[] = []
    const categoryScores = new Map<string, { score: number; matches: string[] }>()

    for (const keywordData of data || []) {
      for (let i = 0; i < keywordData.keywords.length; i++) {
        const keyword = keywordData.keywords[i].toLowerCase()
        const confidence = keywordData.confidence_scores[i] || 0.5

        // Check for matches
        const exactMatch = words.includes(keyword)
        const partialMatch = words.some(word => word.includes(keyword) || keyword.includes(word))

        if (exactMatch || partialMatch) {
          const categoryId = keywordData.categories.id
          const matchScore = exactMatch ? confidence : confidence * 0.7
          const isPersonal = keywordData.user_id === userId ? 1.2 : 1.0 // Boost personal keywords

          const existing = categoryScores.get(categoryId)
          const newScore = matchScore * isPersonal
          const match = exactMatch ? keyword : `~${keyword}`

          if (existing) {
            existing.score = Math.max(existing.score, newScore)
            existing.matches.push(match)
          } else {
            categoryScores.set(categoryId, {
              score: newScore,
              matches: [match]
            })
          }
        }
      }
    }

    // Convert to suggestions and sort by score
    for (const [categoryId, { score, matches }] of categoryScores.entries()) {
      const keywordData = data?.find(d => d.categories.id === categoryId)
      if (keywordData && score > 0.3) {
        suggestions.push({
          category_id: categoryId,
          category_name: keywordData.categories.name,
          confidence_score: Math.min(score, 1.0),
          reasoning: [`Keywords: ${matches.slice(0, 3).join(', ')}`],
          suggestion_type: 'description',
          icon: '🔍',
          badge: score > 0.8 ? 'recommended' : undefined
        })
      }
    }

      return suggestions
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 5)
    } catch (error) {
      console.error('Error in getDescriptionBasedSuggestions:', error)
      return []
    }
  }

  /**
   * Get amount-based category suggestions
   */
  private async getAmountBasedSuggestions(
    userId: string,
    amount: number
  ): Promise<CategorySuggestion[]> {
    try {
      const { data, error } = await this.supabase
        .from('category_amount_patterns')
        .select(`
          *,
          categories!inner(id, name)
        `)
        .eq('user_id', userId)
        .lte('typical_amount_min', amount * 1.2) // 20% tolerance
        .gte('typical_amount_max', amount * 0.8)

      if (error) {
        // Table doesn't exist yet - migration hasn't been run
        if (error.code === '42P01') {
          return []
        }
        console.error('Error fetching amount patterns:', error)
        return []
      }

    return (data || [])
      .map(pattern => {
        const avgDiff = Math.abs(pattern.average_amount - amount) / pattern.average_amount
        const confidence = Math.max(0.1, 1 - avgDiff)

        return {
          category_id: pattern.categories.id,
          category_name: pattern.categories.name,
          confidence_score: confidence,
          reasoning: [
            `Typical amount: $${pattern.average_amount.toFixed(2)}`,
            `${pattern.transaction_count} transactions`
          ],
          suggestion_type: 'amount' as const,
          icon: '💰'
        }
      })
        .filter(s => s.confidence_score > 0.3)
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 3)
    } catch (error) {
      console.error('Error in getAmountBasedSuggestions:', error)
      return []
    }
  }

  /**
   * Get time-based category suggestions
   */
  private async getTimeBasedSuggestions(
    userId: string,
    date: Date
  ): Promise<CategorySuggestion[]> {
    try {
      const dayOfWeek = date.getDay()
      const hour = date.getHours()
      const dayOfMonth = date.getDate()

      const { data, error } = await this.supabase
        .from('category_time_patterns')
        .select(`
          *,
          categories!inner(id, name)
        `)
        .eq('user_id', userId)

      if (error) {
        // Table doesn't exist yet - migration hasn't been run
        if (error.code === '42P01') {
          return []
        }
        console.error('Error fetching time patterns:', error)
        return []
      }

    return (data || [])
      .map(pattern => {
        const dowScore = (pattern.day_of_week_patterns[dayOfWeek] || 0) / 10
        const hourScore = (pattern.hour_patterns[hour] || 0) / 5
        const dayScore = (pattern.monthly_patterns[dayOfMonth - 1] || 0) / 3
        
        const confidence = (dowScore + hourScore + dayScore) / 3
        const reasons = []

        if (dowScore > 0.3) reasons.push('Common for this day of week')
        if (hourScore > 0.3) reasons.push('Common for this time')
        if (dayScore > 0.3) reasons.push('Common for this day of month')

        return {
          category_id: pattern.categories.id,
          category_name: pattern.categories.name,
          confidence_score: Math.min(confidence, 0.8),
          reasoning: reasons.length > 0 ? reasons : ['Historical timing match'],
          suggestion_type: 'time' as const,
          icon: '🕐'
        }
      })
        .filter(s => s.confidence_score > 0.2)
        .sort((a, b) => b.confidence_score - a.confidence_score)
        .slice(0, 3)
    } catch (error) {
      console.error('Error in getTimeBasedSuggestions:', error)
      return []
    }
  }

  /**
   * Combine smart suggestions from multiple sources
   */
  private combineSmartSuggestions(
    descriptionSuggestions: CategorySuggestion[],
    amountSuggestions: CategorySuggestion[],
    timeSuggestions: CategorySuggestion[],
    categoryMap: Map<string, Category>
  ): CategorySuggestion[] {
    const combinedScores = new Map<string, {
      suggestion: CategorySuggestion
      totalScore: number
      sources: string[]
    }>()

    // Combine all suggestions
    const allSuggestions = [
      ...descriptionSuggestions,
      ...amountSuggestions,
      ...timeSuggestions
    ]

    for (const suggestion of allSuggestions) {
      const existing = combinedScores.get(suggestion.category_id)
      const sourceWeight = {
        description: 1.0,
        amount: 0.7,
        time: 0.5
      }[suggestion.suggestion_type] || 0.3

      const weightedScore = suggestion.confidence_score * sourceWeight

      if (existing) {
        existing.totalScore += weightedScore
        existing.sources.push(suggestion.suggestion_type)
        // Combine reasoning
        existing.suggestion.reasoning = [
          ...existing.suggestion.reasoning,
          ...suggestion.reasoning
        ]
      } else {
        combinedScores.set(suggestion.category_id, {
          suggestion: {
            ...suggestion,
            suggestion_type: 'ai',
            icon: '🤖'
          },
          totalScore: weightedScore,
          sources: [suggestion.suggestion_type]
        })
      }
    }

    // Convert to array and update confidence scores
    return Array.from(combinedScores.values())
      .map(({ suggestion, totalScore, sources }) => ({
        ...suggestion,
        confidence_score: Math.min(totalScore, 1.0),
        reasoning: [...new Set(suggestion.reasoning)], // Remove duplicates
        badge: totalScore > 0.8 ? 'recommended' as const : undefined
      }))
      .filter(s => s.confidence_score > 0.5)
      .sort((a, b) => b.confidence_score - a.confidence_score)
      .slice(0, 3)
  }

  /**
   * Calculate frequency-based confidence score
   */
  private calculateFrequencyScore(usage: CategoryUsage): number {
    const usageWeight = Math.min(usage.usage_count / 20, 1.0) * 0.4
    const frequencyWeight = Math.min(usage.weekly_frequency / 5, 1.0) * 0.3
    
    // Recency bonus (last 7 days = full bonus, older = decay)
    const daysSinceUsed = (Date.now() - new Date(usage.last_used).getTime()) / (24 * 60 * 60 * 1000)
    const recencyWeight = Math.max(0, 1 - daysSinceUsed / 30) * 0.3

    return Math.min(usageWeight + frequencyWeight + recencyWeight, 1.0)
  }

  /**
   * Track category usage (called after transaction creation)
   */
  async trackCategoryUsage(
    userId: string,
    categoryId: string,
    description: string
  ): Promise<void> {
    try {
      // Extract keywords from description
      const keywords = this.extractKeywords(description)
      
      if (keywords.length > 0) {
        // Update or create keywords for this category
        await this.updateCategoryKeywords(userId, categoryId, keywords)
      }
    } catch (error) {
      console.error('Error tracking category usage:', error)
    }
  }

  /**
   * Extract meaningful keywords from transaction description
   */
  private extractKeywords(description: string): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'is', 'are', 'was', 'were', 'be',
      'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can'
    ])

    return description
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.has(word))
      .slice(0, 5) // Keep top 5 keywords
  }

  /**
   * Update category keywords based on user selections
   */
  private async updateCategoryKeywords(
    userId: string,
    categoryId: string,
    keywords: string[]
  ): Promise<void> {
    try {
      // For now, we'll implement a simple version
      // In production, this would use more sophisticated ML techniques

      const { data: existing, error: fetchError } = await this.supabase
        .from('category_keywords')
        .select('*')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .single()

      if (fetchError) {
        // Table doesn't exist yet - migration hasn't been run
        if (fetchError.code === '42P01') {
          return
        }
        // Not found error is expected when no keywords exist yet
        if (fetchError.code !== 'PGRST116') {
          console.error('Error fetching existing keywords:', fetchError)
          return
        }
      }

    const baseConfidence = 0.6
    const confidenceScores = keywords.map(() => baseConfidence)

    if (existing) {
      // Merge with existing keywords
      const mergedKeywords = [...existing.keywords]
      const mergedScores = [...existing.confidence_scores]

      for (const keyword of keywords) {
        const existingIndex = mergedKeywords.indexOf(keyword)
        if (existingIndex >= 0) {
          // Boost existing keyword confidence
          mergedScores[existingIndex] = Math.min(
            mergedScores[existingIndex] + 0.1,
            1.0
          )
        } else {
          // Add new keyword
          mergedKeywords.push(keyword)
          mergedScores.push(baseConfidence)
        }
      }

      await this.supabase
        .from('category_keywords')
        .update({
          keywords: mergedKeywords,
          confidence_scores: mergedScores
        })
        .eq('id', existing.id)
    } else {
      // Create new keyword entry
      await this.supabase
        .from('category_keywords')
        .insert({
          user_id: userId,
          category_id: categoryId,
          keywords,
          confidence_scores: confidenceScores
        })
      }
    } catch (error) {
      console.error('Error updating category keywords:', error)
    }
  }
}