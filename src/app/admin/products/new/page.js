import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ProductEditorScreen from "@/components/admin/products/ProductEditorScreen";

export default function AdminNewProductPage() {
  return (
    <AdminGuard>
      <AdminShell title="Add Product">
        <ProductEditorScreen />
      </AdminShell>
    </AdminGuard>
  );
}
