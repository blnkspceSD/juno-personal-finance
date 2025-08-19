# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-08-14-category-group-cards/spec.md

> Created: 2025-08-14
> Version: 1.0.0

## Endpoints

### Category Groups Management

#### GET /api/category-groups
**Description**: Retrieve all category groups for the authenticated user with associated categories and progress data

**Parameters**: None

**Response**: 
```typescript
{
  success: true,
  data: {
    groups: CategoryGroupWithProgress[],
    ungroupedCategories: CategoryWithGroup[],
    summary: {
      totalGroups: number,
      totalCategories: number,
      totalAllocated: number,
      totalSpent: number
    }
  }
}

interface CategoryGroupWithProgress extends CategoryGroup {
  categories: CategoryWithGroup[]
  summary: {
    totalAllocated: number
    totalSpent: number
    remainingBudget: number
    utilizationRate: number
    overspentCount: number
    categoryCount: number
    healthStatus: 'healthy' | 'warning' | 'overspent' | 'underfunded'
  }
  progressSegments: CategoryProgressSegment[]
}
```

#### POST /api/category-groups
**Description**: Create a new category group

**Request Body**:
```typescript
{
  name: string // 1-100 characters
  description?: string // max 500 characters
  color?: string // hex color format #RRGGBB
  icon?: string // emoji or icon identifier
  sort_order?: number
}
```

**Response**:
```typescript
{
  success: true,
  data: CategoryGroup
}
```

#### PATCH /api/category-groups/[id]
**Description**: Update an existing category group

**Parameters**: 
- `id`: UUID of the category group

**Request Body**:
```typescript
{
  name?: string
  description?: string
  color?: string
  icon?: string
  sort_order?: number
}
```

**Response**:
```typescript
{
  success: true,
  data: CategoryGroup
}
```

#### DELETE /api/category-groups/[id]
**Description**: Delete a category group (moves all categories to ungrouped)

**Parameters**: 
- `id`: UUID of the category group

**Response**:
```typescript
{
  success: true,
  message: string,
  data: {
    deletedGroupId: string,
    movedCategories: number
  }
}
```

### Group Organization

#### POST /api/category-groups/reorder
**Description**: Update the sort order for multiple category groups

**Request Body**:
```typescript
{
  groupOrders: {
    id: string
    sort_order: number
  }[]
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    updatedGroups: CategoryGroup[]
  }
}
```

#### POST /api/category-groups/bulk-assign
**Description**: Assign multiple categories to groups in batch

**Request Body**:
```typescript
{
  assignments: {
    categoryId: string
    groupId: string | null // null for ungrouped
  }[]
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    updatedCategories: CategoryWithGroup[]
  }
}
```

### Default Groups Setup

#### POST /api/category-groups/setup-defaults
**Description**: Create default category groups for a new user

**Request Body**:
```typescript
{
  includeGroups?: string[] // Optional array of default group types to create
  autoAssignCategories?: boolean // Whether to auto-assign existing categories
}
```

**Response**:
```typescript
{
  success: true,
  data: {
    createdGroups: CategoryGroup[]
    assignedCategories: CategoryWithGroup[]
  }
}
```

#### GET /api/category-groups/default-templates
**Description**: Get available default group templates

**Response**:
```typescript
{
  success: true,
  data: {
    templates: DefaultGroupTemplate[]
  }
}

interface DefaultGroupTemplate {
  id: string
  name: string
  description: string
  color: string
  icon: string
  categoryTypes: string[] // Types of categories that typically belong in this group
  priority: number // Display priority in setup wizard
}
```

### Group Analytics

#### GET /api/category-groups/[id]/analytics
**Description**: Get detailed analytics for a specific category group

**Parameters**: 
- `id`: UUID of the category group
- Query params:
  - `period?: string` - "month" | "quarter" | "year" (default: "month")
  - `startDate?: string` - ISO date string
  - `endDate?: string` - ISO date string

**Response**:
```typescript
{
  success: true,
  data: {
    group: CategoryGroup
    analytics: {
      period: string
      totalAllocated: number
      totalSpent: number
      avgMonthlySpent: number
      utilizationTrend: number // Positive/negative percentage change
      categoryBreakdown: CategoryAnalytics[]
      spendingPattern: {
        weeklyAverage: number
        peakSpendingDays: number[]
        monthlyTrend: number[]
      }
    }
  }
}

interface CategoryAnalytics {
  categoryId: string
  categoryName: string
  allocated: number
  spent: number
  transactions: number
  avgTransactionAmount: number
  utilizationRate: number
}
```

#### GET /api/category-groups/progress-summary
**Description**: Get progress summary for all groups (optimized for dashboard display)

**Response**:
```typescript
{
  success: true,
  data: {
    groups: GroupProgressSummary[]
    overallSummary: {
      totalGroups: number
      healthyGroups: number
      warningGroups: number
      overspentGroups: number
      underfundedGroups: number
    }
  }
}

interface GroupProgressSummary {
  id: string
  name: string
  color: string
  icon?: string
  healthStatus: HealthStatus
  utilizationRate: number
  budgetRemaining: number
  categoryCount: number
  overspentCategories: number
}
```

## Controllers

### CategoryGroupController

#### GET /api/category-groups
```typescript
export async function GET(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  // Get user session
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    // Fetch groups with categories using the existing view
    const { data: groupsData, error: groupsError } = await supabase
      .from('active_categories_with_groups')
      .select('*')
      .eq('user_id', user.id)
      .order('group_sort_order', { ascending: true, nullsFirst: false })
      .order('sort_order', { ascending: true })
    
    if (groupsError) throw groupsError
    
    // Transform data for enhanced group cards
    const transformedData = await transformCategoryGroupData(groupsData, user.id)
    
    return NextResponse.json({
      success: true,
      data: transformedData
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch category groups' },
      { status: 500 }
    )
  }
}
```

#### POST /api/category-groups
```typescript
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const body = await request.json()
    const validatedData = validateCategoryGroupData(body)
    
    const { data: newGroup, error: insertError } = await supabase
      .from('category_groups')
      .insert({
        ...validatedData,
        user_id: user.id
      })
      .select()
      .single()
    
    if (insertError) throw insertError
    
    return NextResponse.json({
      success: true,
      data: newGroup
    })
  } catch (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'Group name already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create category group' },
      { status: 500 }
    )
  }
}
```

### GroupAnalyticsController

#### GET /api/category-groups/[id]/analytics
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies })
  const { searchParams } = new URL(request.url)
  
  const period = searchParams.get('period') || 'month'
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    // Verify group ownership
    const { data: group, error: groupError } = await supabase
      .from('category_groups')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()
    
    if (groupError || !group) {
      return NextResponse.json(
        { success: false, error: 'Group not found' },
        { status: 404 }
      )
    }
    
    // Calculate analytics
    const analytics = await calculateGroupAnalytics({
      groupId: params.id,
      userId: user.id,
      period,
      startDate,
      endDate,
      supabase
    })
    
    return NextResponse.json({
      success: true,
      data: {
        group,
        analytics
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to calculate analytics' },
      { status: 500 }
    )
  }
}
```

### DefaultGroupsController

#### POST /api/category-groups/setup-defaults
```typescript
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  
  try {
    const { includeGroups, autoAssignCategories = true } = await request.json()
    
    // Get default group templates
    const templates = getDefaultGroupTemplates(includeGroups)
    
    // Create default groups
    const { data: createdGroups, error: createError } = await supabase
      .from('category_groups')
      .insert(
        templates.map((template, index) => ({
          user_id: user.id,
          name: template.name,
          description: template.description,
          color: template.color,
          icon: template.icon,
          sort_order: index
        }))
      )
      .select()
    
    if (createError) throw createError
    
    let assignedCategories: CategoryWithGroup[] = []
    
    // Auto-assign existing categories if requested
    if (autoAssignCategories) {
      assignedCategories = await autoAssignCategoriesToGroups({
        userId: user.id,
        groups: createdGroups,
        supabase
      })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        createdGroups,
        assignedCategories
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to setup default groups' },
      { status: 500 }
    )
  }
}
```

### Utility Functions

#### Data Transformation
```typescript
async function transformCategoryGroupData(
  rawData: any[],
  userId: string
): Promise<{
  groups: CategoryGroupWithProgress[]
  ungroupedCategories: CategoryWithGroup[]
  summary: GroupsSummary
}> {
  // Group categories by group_id
  const groupedData = rawData.reduce((acc, item) => {
    const groupId = item.group_id || 'ungrouped'
    if (!acc[groupId]) acc[groupId] = []
    acc[groupId].push(item)
    return acc
  }, {})
  
  // Transform grouped data
  const groups = Object.entries(groupedData)
    .filter(([groupId]) => groupId !== 'ungrouped')
    .map(([groupId, categories]) => {
      const groupInfo = categories[0] // Group info is same across categories
      const summary = calculateGroupSummary(categories)
      const progressSegments = calculateProgressSegments(categories)
      
      return {
        id: groupId,
        user_id: userId,
        name: groupInfo.group_name,
        description: groupInfo.group_description,
        color: groupInfo.group_color,
        icon: groupInfo.group_icon,
        sort_order: groupInfo.group_sort_order,
        created_at: groupInfo.group_created_at,
        updated_at: groupInfo.group_updated_at,
        categories: categories as CategoryWithGroup[],
        summary,
        progressSegments
      }
    })
  
  const ungroupedCategories = groupedData.ungrouped || []
  const summary = calculateOverallSummary(groups, ungroupedCategories)
  
  return { groups, ungroupedCategories, summary }
}

function calculateGroupSummary(categories: any[]): GroupSummary {
  const totalAllocated = categories.reduce((sum, cat) => sum + (cat.allocated || 0), 0)
  const totalSpent = categories.reduce((sum, cat) => sum + (cat.spent || 0), 0)
  const overspentCount = categories.filter(cat => (cat.spent || 0) > (cat.allocated || 0)).length
  const categoryCount = categories.length
  
  const remainingBudget = totalAllocated - totalSpent
  const utilizationRate = totalAllocated > 0 ? (totalSpent / totalAllocated) : 0
  
  let healthStatus: HealthStatus = 'healthy'
  if (overspentCount > 0) healthStatus = 'overspent'
  else if (utilizationRate > 0.9) healthStatus = 'warning'
  else if (totalAllocated === 0) healthStatus = 'underfunded'
  
  return {
    totalAllocated,
    totalSpent,
    remainingBudget,
    utilizationRate,
    overspentCount,
    categoryCount,
    healthStatus
  }
}
```