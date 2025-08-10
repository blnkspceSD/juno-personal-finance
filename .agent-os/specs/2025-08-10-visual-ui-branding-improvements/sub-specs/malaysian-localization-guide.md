# Malaysian Localization Guide for Juno

## Overview

This guide provides comprehensive localization requirements for Juno's visual redesign, ensuring the application serves Malaysian users effectively while maintaining global accessibility. The approach is **Malaysian-first** while staying globally legible.

## 1. Currency Formatting & Display

### 1.1 Malaysian Ringgit (RM) Standards

**Primary Currency Format:**
- **Symbol**: "RM" (always before the number)
- **Decimal places**: 2 digits (RM123.45)
- **Thousands separator**: Comma (RM1,234.56)
- **Negative amounts**: -RM123.45 (minus before symbol)

**Implementation:**
```typescript
const formatRinggit = (amount: number, options: RinggitFormatOptions = {}) => {
  const {
    showSymbol = true,
    decimalPlaces = 2,
    locale = 'en-MY'
  } = options

  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces
  })

  // Malaysian preference: RM before number
  return formatter.format(amount).replace('MYR', 'RM')
}

// Examples:
formatRinggit(1234.56)        // "RM1,234.56"
formatRinggit(1000)           // "RM1,000.00"
formatRinggit(-250.75)        // "-RM250.75"
```

### 1.2 Large Number Formatting

**Malaysian Context:**
```typescript
const formatLargeAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `RM${(amount / 1000000).toFixed(1)}M`  // RM2.5M
  }
  if (amount >= 1000) {
    return `RM${(amount / 1000).toFixed(1)}K`     // RM15.5K
  }
  return formatRinggit(amount)
}
```

### 1.3 Common Malaysian Amount Ranges

**Typical Budget Ranges for UI Examples:**
- **Monthly salary**: RM3,000 - RM8,000
- **Weekly food budget**: RM200 - RM500
- **Transport budget**: RM300 - RM600
- **Emergency fund goal**: RM5,000 - RM20,000
- **Daily spending**: RM30 - RM100

## 2. Language Support

### 2.1 Bilingual Approach (English Primary)

**Strategy**: English-first with selective Malay translations for key financial terms that resonate better in local context.

**Key Malay Terms to Include:**
```typescript
const malaysianTerms = {
  // Core financial concepts
  'budget': { en: 'Budget', ms: 'Bajet' },
  'savings': { en: 'Savings', ms: 'Simpanan' },
  'expenses': { en: 'Expenses', ms: 'Perbelanjaan' },
  'income': { en: 'Income', ms: 'Pendapatan' },
  'balance': { en: 'Balance', ms: 'Baki' },
  
  // Time periods
  'monthly': { en: 'Monthly', ms: 'Bulanan' },
  'weekly': { en: 'Weekly', ms: 'Mingguan' },
  'daily': { en: 'Daily', ms: 'Harian' },
  
  // Common actions
  'save': { en: 'Save', ms: 'Simpan' },
  'spend': { en: 'Spend', ms: 'Belanja' },
  'transfer': { en: 'Transfer', ms: 'Pindah' },
  'plan': { en: 'Plan', ms: 'Rancang' },
  
  // Categories
  'food': { en: 'Food & Dining', ms: 'Makanan' },
  'transport': { en: 'Transport', ms: 'Pengangkutan' },
  'bills': { en: 'Bills', ms: 'Bil' },
  'shopping': { en: 'Shopping', ms: 'Membeli-belah' }
}
```

### 2.2 UI Text Guidelines

**Tone & Voice for Malaysian Context:**
- **Respectful**: Never condescending about financial situations
- **Practical**: Focus on actionable advice
- **Encouraging**: Positive reinforcement for good habits
- **Clear**: Avoid financial jargon

**Example Microcopy:**
```typescript
const malayisan_microcopy = {
  dashboard: {
    available_this_week: {
      en: "Available to spend this week: RM{amount}",
      ms: "Baki untuk minggu ini: RM{amount}"
    },
    category_over_budget: {
      en: "{category} is over by RM{amount}. Move RM{amount} or adjust next week's plan.",
      ms: "Kategori {category} terlebih RM{amount}. Pindahkan RM{amount} atau sesuaikan pelan minggu depan."
    },
    budget_on_track: {
      en: "You're on track! RM{amount} left for the month.",
      ms: "Anda berada di landasan yang betul! Baki RM{amount} untuk bulan ini."
    }
  },
  
  explanations: {
    available_budget: {
      en: "This is your remaining budget after fixed bills and savings goals.",
      ms: "Ini adalah baki bajet anda selepas bil tetap dan matlamat simpanan."
    },
    emergency_fund: {
      en: "Recommended 3-6 months of expenses. Start with RM1,000 as your first goal.",
      ms: "Disyorkan 3-6 bulan perbelanjaan. Mulakan dengan RM1,000 sebagai matlamat pertama."
    }
  }
}
```

## 3. Cultural Context & Financial Behavior

### 3.1 Malaysian Financial Patterns

**Common Financial Priorities:**
1. **Family support** - Many young Malaysians support parents/family
2. **Emergency fund** - Important due to job market volatility
3. **Housing** - Rent typically 20-30% of income in urban areas
4. **Transport** - Mix of public transport and car ownership
5. **Food** - Mix of home cooking and eating out (mamak culture)

**Budget Category Suggestions:**
```typescript
const malaysianCategories = [
  { name: 'Family Support', ms: 'Sokongan Keluarga', typical_pct: 15 },
  { name: 'Food & Dining', ms: 'Makanan', typical_pct: 25 },
  { name: 'Transport', ms: 'Pengangkutan', typical_pct: 15 },
  { name: 'Housing', ms: 'Perumahan', typical_pct: 30 },
  { name: 'Bills & Utilities', ms: 'Bil & Utiliti', typical_pct: 10 },
  { name: 'Personal', ms: 'Peribadi', typical_pct: 5 }
]
```

### 3.2 BNPL & Credit Context

**Malaysian-Specific Challenges:**
- **BNPL proliferation**: Grab PayLater, Shopee PayLater, etc.
- **Credit card debt**: Common among young professionals
- **Islamic banking**: Consideration for Shariah-compliant options

**Educational Content:**
```typescript
const bnplEducation = {
  warning_threshold: {
    en: "You have 3 BNPL payments totaling RM{amount} due this month.",
    ms: "Anda mempunyai 3 bayaran BNPL berjumlah RM{amount} yang akan jatuh tempoh bulan ini."
  },
  explanation: {
    en: "BNPL payments can impact your cash flow. Consider consolidating or reducing usage.",
    ms: "Bayaran BNPL boleh menjejaskan aliran tunai anda. Pertimbangkan untuk menggabungkan atau mengurangkan penggunaan."
  }
}
```

## 4. Date & Time Formatting

### 4.1 Malaysian Date Standards

**Preferred Format**: DD/MM/YYYY (British influence)
- **Short date**: 15/08/2025
- **Medium date**: 15 Aug 2025
- **Long date**: 15 August 2025
- **With day**: Friday, 15 August 2025

```typescript
const formatMalaysianDate = (date: Date, format: 'short' | 'medium' | 'long' = 'medium') => {
  const formatters = {
    short: new Intl.DateTimeFormat('en-MY', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    }),
    medium: new Intl.DateTimeFormat('en-MY', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    }),
    long: new Intl.DateTimeFormat('en-MY', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  return formatters[format].format(date)
}
```

### 4.2 Time Zones & Business Hours

**Malaysian Standard Time (MST)**: UTC+8
- **Business hours**: 9:00 AM - 6:00 PM
- **Banking hours**: 9:30 AM - 4:00 PM (weekdays)
- **Weekend**: Saturday-Sunday (different from Middle East markets)

## 5. Payment Methods & Banking

### 5.1 Common Malaysian Payment Methods

**Digital Payment Preferences:**
1. **DuitNow** - Interbank transfer system
2. **FPX** - Online banking
3. **Touch 'n Go eWallet**
4. **GrabPay**
5. **Boost**
6. **Credit/Debit cards**

**Bank Integration Considerations:**
```typescript
const malaysianBanks = [
  { name: 'Maybank', code: 'MBB', color: '#FFD700' },
  { name: 'CIMB', code: 'CIMB', color: '#DC143C' },
  { name: 'Public Bank', code: 'PBB', color: '#FF6347' },
  { name: 'Hong Leong Bank', code: 'HLB', color: '#4169E1' },
  { name: 'AmBank', code: 'AMB', color: '#228B22' },
  { name: 'Bank Islam', code: 'BIMB', color: '#008000' },
  { name: 'RHB Bank', code: 'RHB', color: '#0000FF' }
]
```

### 5.2 Islamic Banking Considerations

**Shariah-Compliant Features:**
- Avoid interest-based terminology
- Use "profit" instead of "interest" for Islamic accounts
- Provide Halal investment options
- Zakat calculation tools

```typescript
const islamicTerminology = {
  'interest': { conventional: 'Interest', islamic: 'Profit' },
  'loan': { conventional: 'Loan', islamic: 'Financing' },
  'mortgage': { conventional: 'Mortgage', islamic: 'Home Financing' },
  'investment': { conventional: 'Investment', islamic: 'Shariah Investment' }
}
```

## 6. Visual & Cultural Design

### 6.1 Color Cultural Considerations

**Malaysian Color Psychology:**
- **Green**: Associated with prosperity, nature, Islam
- **Gold/Yellow**: Prosperity, royalty (Malaysian flag)
- **Red**: Prosperity, good luck (Chinese influence)
- **Blue**: Trust, stability (commonly used in banking)

**Our Juno Colors in Malaysian Context:**
- **Cyan (#85D6FF)**: Modern, tech-forward, calm
- **Dark blue-gray (#212730)**: Professional, trustworthy
- **Combination**: Fresh, approachable, not overly formal

### 6.2 Typography for Malaysian Content

**Considerations:**
- **Mixed scripts**: Primarily Latin, some Arabic for Islamic terms
- **Reading patterns**: Left-to-right, top-to-bottom
- **Font weights**: Regular and semibold work well for Malay text
- **Line height**: Maintain readability for bilingual content

```css
/* Malaysian-optimized typography */
.malaysian-text {
  font-family: var(--font-geist-sans);
  line-height: 1.6; /* Better for mixed language content */
  letter-spacing: 0.01em; /* Slightly increased for clarity */
}

.malay-emphasis {
  font-weight: 600; /* Semibold works well for Malay */
  color: var(--juno-text);
}
```

## 7. Educational Content Strategy

### 7.1 Financial Literacy Context

**Malaysian Financial Education Needs:**
- **Basic budgeting** - Not commonly taught in schools
- **BNPL awareness** - Growing problem among youth
- **Emergency planning** - Cultural shift from family safety nets
- **Investment basics** - Moving beyond traditional savings
- **Islamic finance** - For Muslim majority population

### 7.2 Explain-on-Tap Content Examples

**Budget-Related Explanations:**
```typescript
const explanations = {
  available_budget: {
    title: "Available Budget",
    explanation: "This is money you can spend freely after covering fixed expenses like rent, bills, and savings goals.",
    example: "If you earn RM4,000 monthly and have RM2,800 in fixed costs, your available budget is RM1,200.",
    malay_note: "Ini adalah wang yang boleh anda belanjakan dengan bebas selepas menampung kos tetap."
  },
  
  emergency_fund: {
    title: "Emergency Fund",
    explanation: "Money set aside for unexpected expenses like medical bills or job loss. Start small and build gradually.",
    example: "Aim for RM1,000 first, then work toward 3-6 months of expenses (about RM9,000-RM18,000 for most Malaysians).",
    cultural_note: "Even with family support, having your own emergency fund provides independence and security."
  },
  
  bnpl_tracking: {
    title: "Buy Now, Pay Later (BNPL)",
    explanation: "These are your upcoming payment obligations to services like Grab PayLater, Shopee PayLater, etc.",
    warning: "Multiple BNPL payments can quickly add up and strain your monthly budget.",
    tip: "Set a monthly BNPL limit (e.g., RM200) to avoid overspending."
  }
}
```

## 8. Implementation Guidelines

### 8.1 Component Localization

**Currency Display Component:**
```typescript
interface CurrencyDisplayProps {
  amount: number
  locale?: 'en-MY' | 'ms-MY'
  showExplanation?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  locale = 'en-MY',
  showExplanation = false,
  size = 'md'
}) => {
  const formattedAmount = formatRinggit(amount, { locale })
  
  return (
    <div className={cn('currency-display', `currency-display-${size}`)}>
      <span className="currency-amount" lang={locale}>
        {formattedAmount}
      </span>
      {showExplanation && (
        <ExplainChip 
          explanation="Amount shown in Malaysian Ringgit (RM)"
          aria-label="Currency information"
        />
      )}
    </div>
  )
}
```

**Bilingual Content Component:**
```typescript
interface BilingualTextProps {
  english: string
  malay?: string
  showBoth?: boolean
  primaryLanguage?: 'en' | 'ms'
}

const BilingualText: React.FC<BilingualTextProps> = ({
  english,
  malay,
  showBoth = false,
  primaryLanguage = 'en'
}) => {
  if (showBoth && malay) {
    return (
      <div className="bilingual-text">
        <span className="primary-text" lang="en">{english}</span>
        <span className="secondary-text" lang="ms">({malay})</span>
      </div>
    )
  }
  
  return (
    <span lang={primaryLanguage === 'en' ? 'en' : 'ms'}>
      {primaryLanguage === 'en' ? english : (malay || english)}
    </span>
  )
}
```

### 8.2 Data Structure for Localization

**Localization Data Structure:**
```typescript
interface LocalizationData {
  currency: {
    primary: 'MYR'
    symbol: 'RM'
    decimalPlaces: 2
    thousandsSeparator: ','
    decimalSeparator: '.'
  }
  
  locale: {
    primary: 'en-MY'
    fallback: 'en'
    dateFormat: 'DD/MM/YYYY'
    timeZone: 'Asia/Kuala_Lumpur'
  }
  
  financial: {
    typicalSalaryRange: [3000, 8000]
    budgetCategories: typeof malaysianCategories
    commonPaymentMethods: typeof malaysianBanks
  }
  
  cultural: {
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    bankingHours: {
      start: '09:30'
      end: '16:00'
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  }
}
```

## 9. Testing with Malaysian Users

### 9.1 User Testing Requirements

**Target Demographics:**
- **Age**: 21-35 years old
- **Income**: RM3,000-RM8,000 monthly
- **Location**: Kuala Lumpur, Selangor, Penang (urban areas)
- **Background**: Mix of ethnicities (Malay, Chinese, Indian)
- **Language**: English-educated with Malay familiarity

**Testing Scenarios:**
1. **New user onboarding** with Malaysian bank account
2. **Budget setup** using local categories and amounts
3. **BNPL tracking** with common Malaysian services
4. **Educational content** comprehension testing
5. **Cultural appropriateness** of financial advice

### 9.2 Feedback Collection

**Key Questions for Malaysian Users:**
- Does the RM formatting feel natural and familiar?
- Are the budget categories relevant to your lifestyle?
- Do the explanation tooltips use clear, understandable language?
- Are the example amounts realistic for your income level?
- Does the app feel like it's designed for Malaysians?

## 10. Compliance & Regulations

### 10.1 Malaysian Financial Regulations

**Bank Negara Malaysia (BNM) Considerations:**
- Consumer protection guidelines
- Electronic payment regulations
- Data protection requirements
- Islamic banking compliance

**Privacy & Data Protection:**
- **Personal Data Protection Act 2010** compliance
- Clear consent for financial data processing
- Right to data portability
- Local data storage preferences

### 10.2 Content Guidelines

**Cultural Sensitivity:**
- Respect for all major religions in Malaysia
- Inclusive language for diverse ethnic backgrounds
- Awareness of economic disparities
- No assumptions about family structure or support

**Financial Advice Disclaimer:**
```
Important: This app provides general financial guidance and is not personalized financial advice. For specific financial planning needs, consult with a licensed financial advisor in Malaysia.

Penting: Aplikasi ini memberikan panduan kewangan am dan bukan nasihat kewangan yang dipersonalisasikan. Untuk keperluan perancangan kewangan khusus, berunding dengan penasihat kewangan berlesen di Malaysia.
```