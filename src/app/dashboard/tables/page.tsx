"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ResponsiveTransactionView, 
  ResponsiveCategoryView,
  TransactionTableRow,
  CategoryTableRow 
} from "@/components/tables";

// Mock data for demonstration
const mockCategories: CategoryTableRow[] = [
  {
    id: "1",
    user_id: "user1",
    budget_id: "budget1",
    name: "Groceries",
    allocated: 500,
    spent: 320,
    remaining: 180,
    percentage_used: 64,
    is_overspent: false,
    sort_order: 1,
    color: "#22c55e",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    transaction_count: 12,
  },
  {
    id: "2",
    user_id: "user1",
    budget_id: "budget1",
    name: "Transportation",
    allocated: 300,
    spent: 420,
    remaining: -120,
    percentage_used: 140,
    is_overspent: true,
    sort_order: 2,
    color: "#ef4444",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    transaction_count: 8,
  },
  {
    id: "3",
    user_id: "user1",
    budget_id: "budget1",
    name: "Entertainment",
    allocated: 200,
    spent: 45,
    remaining: 155,
    percentage_used: 22.5,
    is_overspent: false,
    sort_order: 3,
    color: "#8b5cf6",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    transaction_count: 3,
  },
  {
    id: "4",
    user_id: "user1",
    budget_id: "budget1",
    name: "Utilities",
    allocated: 150,
    spent: 147,
    remaining: 3,
    percentage_used: 98,
    is_overspent: false,
    sort_order: 4,
    color: "#f59e0b",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    transaction_count: 2,
  },
];

const mockTransactions: TransactionTableRow[] = [
  {
    id: "1",
    user_id: "user1",
    category_id: "1",
    amount: -45.67,
    description: "Whole Foods Market",
    date: "2025-08-02",
    created_at: "2025-08-02T10:30:00Z",
    updated_at: "2025-08-02T10:30:00Z",
    category: mockCategories[0],
  },
  {
    id: "2",
    user_id: "user1",
    category_id: "2",
    amount: -25.00,
    description: "Gas Station",
    date: "2025-08-01",
    created_at: "2025-08-01T14:15:00Z",
    updated_at: "2025-08-01T14:15:00Z",
    category: mockCategories[1],
  },
  {
    id: "3",
    user_id: "user1",
    category_id: "3",
    amount: -15.99,
    description: "Netflix Subscription",
    date: "2025-08-01",
    created_at: "2025-08-01T09:00:00Z",
    updated_at: "2025-08-01T09:00:00Z",
    category: mockCategories[2],
  },
  {
    id: "4",
    user_id: "user1",
    category_id: "1",
    amount: -89.23,
    description: "Safeway Groceries",
    date: "2025-07-31",
    created_at: "2025-07-31T16:45:00Z",
    updated_at: "2025-07-31T16:45:00Z",
    category: mockCategories[0],
  },
  {
    id: "5",
    user_id: "user1",
    category_id: "4",
    amount: -147.00,
    description: "Electric Bill",
    date: "2025-07-30",
    created_at: "2025-07-30T08:00:00Z",
    updated_at: "2025-07-30T08:00:00Z",
    category: mockCategories[3],
  },
];

export default function TablesPage() {
  const [selectedTab, setSelectedTab] = React.useState<"categories" | "transactions">("categories");

  const handleCategoryEdit = (category: CategoryTableRow) => {
    console.log("Edit category:", category);
    alert(`Edit category: ${category.name}`);
  };

  const handleCategoryDelete = (category: CategoryTableRow) => {
    console.log("Delete category:", category);
    alert(`Delete category: ${category.name}`);
  };

  const handleCategoryAllocate = (category: CategoryTableRow) => {
    console.log("Allocate to category:", category);
    alert(`Allocate funds to: ${category.name}`);
  };

  const handleTransactionEdit = (transaction: TransactionTableRow) => {
    console.log("Edit transaction:", transaction);
    alert(`Edit transaction: ${transaction.description}`);
  };

  const handleTransactionDelete = (transaction: TransactionTableRow) => {
    console.log("Delete transaction:", transaction);
    alert(`Delete transaction: ${transaction.description}`);
  };

  const handleBulkDelete = (transactions: TransactionTableRow[]) => {
    console.log("Bulk delete transactions:", transactions);
    alert(`Delete ${transactions.length} transactions`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Table Components Demo</h1>
        <p className="text-muted-foreground">
          Showcasing the reusable table components with responsive design and real-time capabilities.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={selectedTab === "categories" ? "default" : "outline"}
          onClick={() => setSelectedTab("categories")}
        >
          Categories
        </Button>
        <Button
          variant={selectedTab === "transactions" ? "default" : "outline"}
          onClick={() => setSelectedTab("transactions")}
        >
          Transactions
        </Button>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Features</CardTitle>
          <CardDescription>
            These table components include the following features:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Badge variant="secondary">📱 Responsive Design</Badge>
              <p className="text-sm text-muted-foreground">
                Automatically switches to card view on mobile devices
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">⚡ Real-time Updates</Badge>
              <p className="text-sm text-muted-foreground">
                Live balance updates via WebSocket integration
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">🔍 Advanced Filtering</Badge>
              <p className="text-sm text-muted-foreground">
                Search, sort, and filter with TanStack Table
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">✅ Bulk Operations</Badge>
              <p className="text-sm text-muted-foreground">
                Select multiple items for batch actions
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">♿ Accessible</Badge>
              <p className="text-sm text-muted-foreground">
                WCAG 2.1 AA compliant with keyboard navigation
              </p>
            </div>
            <div className="space-y-2">
              <Badge variant="secondary">🎨 Customizable</Badge>
              <p className="text-sm text-muted-foreground">
                Themed with Tailwind CSS and shadcn/ui
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTab === "categories" ? "Categories Table" : "Transactions Table"}
          </CardTitle>
          <CardDescription>
            {selectedTab === "categories" 
              ? "Manage your budget categories with real-time balance tracking"
              : "View and manage your transactions with advanced filtering"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedTab === "categories" ? (
            <ResponsiveCategoryView
              data={mockCategories}
              onEdit={handleCategoryEdit}
              onDelete={handleCategoryDelete}
              onAllocate={handleCategoryAllocate}
            />
          ) : (
            <ResponsiveTransactionView
              data={mockTransactions}
              onEdit={handleTransactionEdit}
              onDelete={handleTransactionDelete}
              onBulkDelete={handleBulkDelete}
            />
          )}
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Usage</h4>
            <code className="block p-3 bg-muted rounded text-sm">
              {selectedTab === "categories" 
                ? `import { ResponsiveCategoryView } from "@/components/tables";

<ResponsiveCategoryView
  data={categories}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onAllocate={handleAllocate}
/>`
                : `import { ResponsiveTransactionView } from "@/components/tables";

<ResponsiveTransactionView
  data={transactions}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onBulkDelete={handleBulkDelete}
/>`
              }
            </code>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Real-time Integration</h4>
            <p className="text-sm text-muted-foreground mb-2">
              For real-time capabilities, use the enhanced components:
            </p>
            <code className="block p-3 bg-muted rounded text-sm">
              {`import { RealtimeCategoryTable, RealtimeTransactionTable } from "@/components/tables";

// Automatically integrates with useRealtimeBalance hook
<RealtimeCategoryTable budgetId={budgetId} initialCategories={categories} />
<RealtimeTransactionTable budgetId={budgetId} initialTransactions={transactions} />`}
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}