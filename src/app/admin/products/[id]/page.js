import AdminGuard from "@/components/admin/AdminGuard";
import AdminShell from "@/components/admin/AdminShell";
import ProductEditorScreen from "@/components/admin/products/ProductEditorScreen";

export default async function AdminEditProductPage({ params }) {
  const { id } = await params;

  return (
    <AdminGuard>
      <AdminShell title="Edit Product">
        <ProductEditorScreen productId={id} />
      </AdminShell>
    </AdminGuard>
  );
}
