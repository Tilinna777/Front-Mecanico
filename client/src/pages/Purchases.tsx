import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Plus, Trash2, Search, Loader2, ShoppingCart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePurchases, useDeletePurchase, useCreatePurchase } from "@/hooks/use-purchases";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProducts } from "@/hooks/use-products";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPurchaseSchema, type InsertPurchase } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function Purchases() {
  const { user } = useAuth();
  const [searchValue, setSearchValue] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [costFilter, setCostFilter] = useState("all");
  const { data: allPurchases = [], isLoading } = usePurchases();
  const { toast } = useToast();
  
  // Verificar si es ADMIN (compatible con ambos formatos)
  const isAdmin = user?.role === "ADMIN" || user?.role === "administrador";
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Acceso Denegado</h2>
          <p className="text-muted-foreground">Solo los administradores pueden ver esta página.</p>
        </div>
      </div>
    );
  }
  
  // Filtrado de compras
  let purchases = allPurchases.filter(p => {
    const matchesSearch = searchValue === "" || 
                         p.proveedor.nombre.toLowerCase().includes(searchValue.toLowerCase()) ||
                         (p.numero_factura?.toLowerCase() || "").includes(searchValue.toLowerCase());
    
    const matchesSupplier = supplierFilter === "all" || 
                           p.proveedor.nombre.toLowerCase().includes(supplierFilter.toLowerCase());
    
    const matchesMonth = monthFilter === "all" || 
                        new Date(p.fecha).getMonth().toString() === monthFilter;
    
    const matchesCost = costFilter === "all" ||
                       (costFilter === "low" && p.costo_total < 100000) ||
                       (costFilter === "medium" && p.costo_total >= 100000 && p.costo_total < 500000) ||
                       (costFilter === "high" && p.costo_total >= 500000);
    
    return matchesSearch && matchesSupplier && matchesMonth && matchesCost;
  });

  // Ordenar por fecha descendente
  purchases = [...purchases].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gestión de Compras" 
        description="Registre nuevas adquisiciones de stock y gestione proveedores."
        action={
          <div className="flex gap-2">
            <Button variant="outline" className="btn-pill border-slate-300">
              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              Importar Excel
            </Button>
            <CreatePurchaseDialog />
          </div>
        }
      />

      <div className="card-industrial bg-white p-6 space-y-4 mb-6">
        {/* Búsqueda Principal */}
        <div className="relative">
          {!searchFocused && !searchValue && (
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          )}
          <Input 
            placeholder=""
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-slate-50 border-slate-200 rounded-lg h-12 text-base pl-14"
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <span className="text-sm text-slate-600 font-medium">Filtrar por:</span>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[220px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Proveedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Proveedores</SelectItem>
              <SelectItem value="frenos chile">Frenos Chile</SelectItem>
              <SelectItem value="importadora indra">Importadora Indra</SelectItem>
              <SelectItem value="autoplanet">AutoPlanet</SelectItem>
              <SelectItem value="frenos san francisco">Frenos San Francisco</SelectItem>
              <SelectItem value="würth">Würth Chile</SelectItem>
            </SelectContent>
          </Select>
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Mes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Meses</SelectItem>
              <SelectItem value="0">Enero</SelectItem>
              <SelectItem value="1">Febrero</SelectItem>
              <SelectItem value="2">Marzo</SelectItem>
              <SelectItem value="3">Abril</SelectItem>
              <SelectItem value="4">Mayo</SelectItem>
              <SelectItem value="5">Junio</SelectItem>
              <SelectItem value="6">Julio</SelectItem>
              <SelectItem value="7">Agosto</SelectItem>
              <SelectItem value="8">Septiembre</SelectItem>
              <SelectItem value="9">Octubre</SelectItem>
              <SelectItem value="10">Noviembre</SelectItem>
              <SelectItem value="11">Diciembre</SelectItem>
            </SelectContent>
          </Select>
          <Select value={costFilter} onValueChange={setCostFilter}>
            <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200">
              <SelectValue placeholder="Costo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los Costos</SelectItem>
              <SelectItem value="asc">Menor a Mayor</SelectItem>
              <SelectItem value="desc">Mayor a Menor</SelectItem>
              <SelectItem value="range1">Hasta $500.000</SelectItem>
              <SelectItem value="range2">$500.000 - $1.500.000</SelectItem>
              <SelectItem value="range3">Más de $1.500.000</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="card-industrial bg-white p-6">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
              <TableHead className="font-display font-bold text-slate-900 h-14">Proveedor</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Nº Documento</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Fecha</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Items</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">Neto</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">IVA</TableHead>
              <TableHead className="text-right font-display font-bold text-slate-900 h-14">Total</TableHead>
              <TableHead className="font-display font-bold text-slate-900 h-14">Registrado por</TableHead>
              <TableHead className="w-[100px] h-14"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p>Cargando compras...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : purchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 text-slate-300" />
                    <p>No se encontraron compras.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              purchases.map((purchase) => (
                <PurchaseRow key={purchase.id} purchase={purchase} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function PurchaseRow({ purchase }: { purchase: any }) {
  const { toast } = useToast();
  const deleteMutation = useDeletePurchase();

  const handleDelete = () => {
    if (confirm(`¿Estás seguro de eliminar la compra de ${purchase.proveedor.nombre}?`)) {
      deleteMutation.mutate(purchase.id, {
        onSuccess: () => {
          toast({ 
            title: "Compra eliminada", 
            description: `Compra de ${purchase.proveedor.nombre} eliminada correctamente`,
            className: "bg-red-600 text-white border-none"
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo eliminar la compra",
            variant: "destructive"
          });
        }
      });
    }
  };

  return (
    <TableRow className="table-row-hover group border-b border-slate-100">
      <TableCell className="font-semibold text-slate-900">{purchase.proveedor.nombre}</TableCell>
      <TableCell className="text-slate-600 font-mono text-sm">
        {purchase.numero_factura || <span className="text-slate-400">Sin documento</span>}
      </TableCell>
      <TableCell className="text-slate-600">{new Date(purchase.fecha).toLocaleDateString('es-CL')}</TableCell>
      <TableCell className="text-slate-600">{purchase.detalles.length} items</TableCell>
      <TableCell className="text-right font-mono text-slate-900">
        ${purchase.monto_neto.toLocaleString('es-CL')}
      </TableCell>
      <TableCell className="text-right font-mono text-slate-600">
        ${purchase.monto_iva.toLocaleString('es-CL')}
      </TableCell>
      <TableCell className="text-right font-mono font-bold text-slate-900">
        ${purchase.monto_total.toLocaleString('es-CL')}
      </TableCell>
      <TableCell className="text-slate-600 text-sm">{purchase.createdByName}</TableCell>
      <TableCell>
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700"
          >
            {deleteMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

function CreatePurchaseDialog() {
  const [open, setOpen] = useState(false);
  const { mutate: createPurchase, isPending } = useCreatePurchase();
  const { data: products } = useProducts();
  const { toast } = useToast();

  const form = useForm<InsertPurchase>({
    resolver: zodResolver(insertPurchaseSchema),
    defaultValues: {
      supplier: "",
      totalCost: 0,
      items: [{ productId: 0, quantity: 1, cost: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items" as any, // casting due to complex json type in schema
  });

  // Calculate total automatically
  const watchItems = form.watch("items");
  const calculatedTotal = (watchItems as any[]).reduce((sum, item) => sum + (item.cost * item.quantity), 0);

  const onSubmit = (data: InsertPurchase) => {
    // Ensure total matches calculated
    data.totalCost = calculatedTotal;
    
    createPurchase(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
        toast({ title: "Compra registrada", className: "bg-green-600 text-white" });
      },
      onError: () => {
        toast({ title: "Error al registrar", variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="btn-pill bg-primary shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Compra
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl bg-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Compra</DialogTitle>
          <DialogDescription>Ingrese los detalles de la factura de compra.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proveedor</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col justify-center items-end border p-4 rounded-lg bg-slate-50">
                <span className="text-sm text-muted-foreground uppercase">Total Estimado</span>
                <span className="text-2xl font-bold text-primary font-mono">${calculatedTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm uppercase text-slate-500 tracking-wider">Items de la compra</h4>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ productId: 0, quantity: 1, cost: 0 })}>
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar Item
                </Button>
              </div>

              {fields.map((field, index) => {
                const selectedProductId = form.watch(`items.${index}.productId` as any);
                const selectedProduct = products?.find(p => p.id === selectedProductId);
                const quantity = form.watch(`items.${index}.quantity` as any) || 0;
                const unitCost = form.watch(`items.${index}.cost` as any) || 0;
                const subtotal = quantity * unitCost;

                // Stock status indicators based on product's current stock
                const getStockIndicator = () => {
                  if (!selectedProduct) return { emoji: "⚪", text: "Seleccione producto" };
                  const stock = selectedProduct.currentStock || 0;
                  if (stock <= 5) return { emoji: "🔴", text: `Stock BAJO: ${stock} u.` };
                  if (stock <= 15) return { emoji: "🟡", text: `Stock MEDIO: ${stock} u.` };
                  return { emoji: "🟢", text: `Stock BUENO: ${stock} u.` };
                };

                const stockInfo = getStockIndicator();

                return (
                  <div key={field.id} className="p-4 bg-gradient-to-br from-white to-slate-50 rounded-lg border-2 border-slate-200 hover:border-primary/30 transition-all space-y-3 shadow-sm">
                    {/* PRIMERO: Seleccionar Producto */}
                    <div>
                      <FormLabel className="text-xs font-semibold uppercase text-slate-600 mb-2 block">
                        🔍 Seleccionar Producto del Inventario
                      </FormLabel>
                      <div className="flex gap-2">
                        <Select 
                          onValueChange={(val) => {
                            const product = products?.find(p => p.id.toString() === val);
                            form.setValue(`items.${index}.productId` as any, parseInt(val));
                            // Auto-llenar el precio de compra si existe en el producto
                            if (product?.netPrice) {
                              form.setValue(`items.${index}.cost` as any, product.netPrice);
                            }
                          }}
                          value={selectedProductId?.toString()}
                        >
                          <SelectTrigger className="flex-1 h-12 font-medium">
                            <SelectValue placeholder="Buscar por código o descripción..." />
                          </SelectTrigger>
                          <SelectContent>
                            {products?.map(p => (
                              <SelectItem key={p.id} value={p.id.toString()}>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-primary">{p.partNumber}</span>
                                  <span className="text-slate-600">-</span>
                                  <span>{p.compatibleBrand} {p.compatibleModel} ({p.compatibleYear})</span>
                                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">{p.category}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500 hover:bg-red-50 hover:text-red-600 h-12 w-12"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    {selectedProduct && (
                      <>
                        {/* Información del producto seleccionado */}
                        <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-1">Código PR</div>
                            <div className="font-mono font-bold text-slate-800">{selectedProduct.partNumber}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-1">Categoría</div>
                            <div className="font-medium text-slate-800">{selectedProduct.category}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-500 uppercase mb-1">Stock Actual</div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{stockInfo.emoji}</span>
                              <span className="text-sm font-medium">{stockInfo.text}</span>
                            </div>
                          </div>
                        </div>

                        {/* Campos editables: Cantidad y Precio Unitario */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <FormLabel className="text-xs font-semibold uppercase text-slate-600">Cantidad a Comprar</FormLabel>
                            <div className="flex gap-2 items-center">
                              <Input 
                                type="number" 
                                min="1"
                                placeholder="100"
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-11 text-lg font-semibold"
                                {...form.register(`items.${index}.quantity` as any, { valueAsNumber: true })} 
                              />
                              <span className="text-sm font-medium text-slate-500 whitespace-nowrap">UNI.</span>
                            </div>
                          </div>
                          <div>
                            <FormLabel className="text-xs font-semibold uppercase text-slate-600">Precio Unitario Compra</FormLabel>
                            <div className="flex gap-2 items-center">
                              <span className="text-lg font-bold text-slate-500">$</span>
                              <Input 
                                type="number" 
                                min="0"
                                placeholder="100"
                                className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none h-11 text-lg font-mono font-semibold"
                                {...form.register(`items.${index}.cost` as any, { valueAsNumber: true })} 
                              />
                            </div>
                          </div>
                        </div>

                        {/* Subtotal calculado */}
                        <div className="flex justify-end items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm font-semibold text-slate-600 uppercase">Subtotal:</span>
                          <span className="text-2xl font-bold text-green-700 font-mono">${subtotal.toLocaleString()}</span>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Precio Compra Total */}
            <div className="border-2 border-primary rounded-xl p-5 bg-gradient-to-br from-primary/5 to-blue-50">
              <h4 className="font-semibold text-sm uppercase text-slate-700 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Resumen de Compra
              </h4>
              <div className="bg-white rounded-lg p-4 border-2 border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Total de Items:</span>
                  <span className="font-bold text-slate-800">{fields.length}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t-2 border-dashed border-slate-200">
                  <span className="text-lg font-bold text-slate-700 uppercase">Total a Pagar:</span>
                  <span className="text-3xl font-bold text-primary font-mono">${calculatedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" className="btn-pill w-full md:w-auto" disabled={isPending}>
                {isPending ? "Registrando..." : "Confirmar Compra"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
