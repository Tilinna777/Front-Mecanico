import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useCreatePurchase, type CreatePurchaseDTO } from "@/hooks/use-purchases";
import { useProviders, useCreateProvider } from "@/hooks/use-providers";
import { useProducts } from "@/hooks/use-products";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2, Trash2, Search, Plus, ArrowLeft, Package } from "lucide-react";
import { useLocation } from "wouter";

export default function CreatePurchase() {
  const [, setLocation] = useLocation();
  const [providerOpen, setProviderOpen] = useState(false);
  const [createProviderModalOpen, setCreateProviderModalOpen] = useState(false);
  const [searchProvider, setSearchProvider] = useState("");
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchValue, setProductSearchValue] = useState("");
  const [productSearchFocused, setProductSearchFocused] = useState(false);
  const { mutate: createPurchase, isPending } = useCreatePurchase();
  const { data: products = [] } = useProducts();
  const { data: providers = [] } = useProviders();
  const createProviderMutation = useCreateProvider();
  const { toast } = useToast();

  const form = useForm<CreatePurchaseDTO>({
    defaultValues: {
      proveedor_nombre: "",
      numero_documento: "",
      tipo_documento: "FACTURA",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Filtrar proveedores por búsqueda
  const filteredProviders = providers.filter(p => 
    p.nombre.toLowerCase().includes(searchProvider.toLowerCase()) ||
    (p.telefono?.toLowerCase() || "").includes(searchProvider.toLowerCase()) ||
    (p.email?.toLowerCase() || "").includes(searchProvider.toLowerCase())
  );

  // Filtrar productos por búsqueda
  const filteredProducts = products.filter(p =>
    p.sku.toLowerCase().includes(productSearchValue.toLowerCase()) ||
    p.nombre.toLowerCase().includes(productSearchValue.toLowerCase()) ||
    (p.marca?.toLowerCase() || "").includes(productSearchValue.toLowerCase())
  );

  // Calcular total automáticamente
  const watchItems = form.watch("items");
  const calculatedTotal = (watchItems as any[]).reduce((sum, item) => sum + (item.precio_costo * item.cantidad), 0);

  const onSubmit = (data: CreatePurchaseDTO) => {
    // Validar que haya un proveedor
    if (!data.proveedor_nombre?.trim()) {
      toast({ 
        title: "Error", 
        description: "Debe seleccionar un proveedor",
        variant: "destructive" 
      });
      return;
    }

    // Validar que haya al menos un ítem
    if (!data.items || data.items.length === 0) {
      toast({ 
        title: "Error", 
        description: "Debe agregar al menos un producto",
        variant: "destructive" 
      });
      return;
    }
    
    createPurchase(data, {
      onSuccess: () => {
        form.reset();
        setLocation("/purchases");
        toast({ 
          title: "Compra registrada", 
          description: "El stock se actualizará automáticamente",
          className: "bg-green-600 text-white border-none" 
        });
      },
      onError: (error: any) => {
        toast({ 
          title: "Error al registrar", 
          description: error.message || "No se pudo registrar la compra",
          variant: "destructive" 
        });
      }
    });
  };

  const handleAddProductFromSearch = (product: any) => {
    append({
      sku: product.sku,
      nombre: product.nombre,
      marca: product.marca || "",
      calidad: "",
      cantidad: 1,
      precio_costo: 0,
      precio_venta_sugerido: 0,
    });
    setProductSearchOpen(false);
    setProductSearchValue("");
    toast({
      title: "Producto agregado",
      description: `${product.nombre} añadido a la lista`,
      className: "bg-blue-600 text-white border-none"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/purchases")}
                className="hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Registrar Compra</h1>
                <p className="text-sm text-slate-500 mt-0.5">Ingrese los detalles de la factura de compra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Sección: Datos de la compra */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900 pb-2 border-b border-slate-200">
              Datos de la Compra
            </h2>

            <div className="grid grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="proveedor_nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">Proveedor *</FormLabel>
                    <Popover open={providerOpen} onOpenChange={setProviderOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-11 font-normal bg-white border-slate-300 hover:bg-slate-50",
                              !field.value && "text-slate-400"
                            )}
                          >
                            <span className="truncate">{field.value || "Seleccionar proveedor"}</span>
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0 border-slate-200 shadow-lg" align="start">
                        <Command className="rounded-lg">
                          <CommandInput 
                            placeholder="Buscar proveedor..." 
                            value={searchProvider}
                            onValueChange={setSearchProvider}
                            className="h-10 border-none"
                          />
                          <CommandList className="max-h-[250px]">
                            <CommandEmpty className="py-6 text-center text-sm text-slate-500">
                              No se encontró proveedor
                            </CommandEmpty>
                            <CommandGroup>
                              {filteredProviders.map((provider) => (
                                <CommandItem
                                  key={provider.id}
                                  value={provider.nombre}
                                  onSelect={() => {
                                    form.setValue("proveedor_nombre", provider.nombre);
                                    setProviderOpen(false);
                                    setSearchProvider("");
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4 text-primary",
                                      provider.nombre === field.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-slate-900 truncate">{provider.nombre}</div>
                                    {(provider.telefono || provider.email) && (
                                      <div className="text-xs text-slate-500 truncate">
                                        {provider.telefono || provider.email}
                                      </div>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                    <button
                      type="button"
                      onClick={() => setCreateProviderModalOpen(true)}
                      className="text-xs text-slate-500 hover:text-primary transition-colors mt-1.5 block"
                    >
                      + Crear nuevo proveedor
                    </button>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tipo_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">Tipo de Documento *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-white border-slate-300">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="border-slate-200">
                        <SelectItem value="FACTURA">Factura</SelectItem>
                        <SelectItem value="BOLETA">Boleta</SelectItem>
                        <SelectItem value="NOTA">Nota</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="numero_documento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">Número de Documento</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ej: F-12345" className="h-11 bg-white border-slate-300" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sección: Detalle de ítems */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">
                Detalle de Ítems
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setLocation("/inventory")}
                className="text-slate-600 hover:text-primary border-slate-300"
              >
                <Package className="w-4 h-4 mr-2" />
                Gestionar Productos
              </Button>
            </div>

            {/* Barra de búsqueda de productos */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 block">Buscar producto</label>
              <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Search className={cn(
                      "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-opacity duration-200",
                      (productSearchFocused || productSearchValue) && "opacity-0"
                    )} />
                    <Input
                      placeholder=""
                      value={productSearchValue}
                      onChange={(e) => {
                        setProductSearchValue(e.target.value);
                        setProductSearchOpen(true);
                      }}
                      onFocus={() => {
                        setProductSearchOpen(true);
                        setProductSearchFocused(true);
                      }}
                      onBlur={() => setProductSearchFocused(false)}
                      className={cn(
                        "h-12 bg-white border-slate-300 text-base transition-all duration-200 shadow-sm hover:border-slate-400 focus:border-primary",
                        (productSearchFocused || productSearchValue) ? "pl-4" : "pl-12"
                      )}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-[600px] p-0 border-slate-200 shadow-xl" 
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-500">
                        <Package className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                        <p>No se encontraron productos</p>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setLocation("/inventory")}
                          className="mt-2 text-primary"
                        >
                          Ir a Inventario para crear producto
                        </Button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredProducts.map((product) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => handleAddProductFromSearch(product)}
                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                    {product.sku}
                                  </span>
                                  <span className="font-medium text-slate-900 truncate">
                                    {product.nombre}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                  {product.marca && <span>Marca: {product.marca}</span>}
                                  <span>Stock: {product.stock_actual}</span>
                                </div>
                              </div>
                              <Plus className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Lista de ítems */}
            {fields.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Package className="w-16 h-16 mx-auto mb-3 text-slate-200" />
                <p className="text-sm">No hay productos agregados</p>
                <p className="text-xs mt-1">Utiliza el buscador para agregar productos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const cantidad = form.watch(`items.${index}.cantidad`) || 0;
                  const precioCosto = form.watch(`items.${index}.precio_costo`) || 0;
                  const subtotal = cantidad * precioCosto;

                  return (
                    <div key={field.id} className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200">
                      {/* Fila 1: Principal */}
                      <div className="grid grid-cols-12 gap-4 items-start mb-4">
                        {/* SKU */}
                        <div className="col-span-2">
                          <FormLabel className="text-xs font-medium text-slate-600 uppercase tracking-wide">SKU</FormLabel>
                          <Input 
                            placeholder="FRN-001"
                            className="h-10 font-mono text-sm mt-1.5 uppercase bg-white border-slate-300"
                            {...form.register(`items.${index}.sku`)}
                            onChange={(e) => {
                              form.setValue(`items.${index}.sku`, e.target.value.toUpperCase());
                            }}
                          />
                        </div>

                        {/* Producto */}
                        <div className="col-span-5">
                          <FormLabel className="text-xs font-medium text-slate-600 uppercase tracking-wide">Producto *</FormLabel>
                          <Input 
                            placeholder="Ej: Pastillas de freno delanteras"
                            className="h-10 mt-1.5 bg-white border-slate-300"
                            {...form.register(`items.${index}.nombre`)}
                          />
                        </div>

                        {/* Cantidad */}
                        <div className="col-span-2">
                          <FormLabel className="text-xs font-medium text-slate-600 uppercase tracking-wide">Cantidad *</FormLabel>
                          <Input 
                            type="text"
                            placeholder="1"
                            className="h-10 mt-1.5 bg-white border-slate-300 text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            {...form.register(`items.${index}.cantidad`, { 
                              valueAsNumber: true,
                              setValueAs: (v) => v === '' ? 0 : parseInt(v)
                            })}
                          />
                        </div>

                        {/* Precio Costo */}
                        <div className="col-span-2">
                          <FormLabel className="text-xs font-medium text-slate-600 uppercase tracking-wide">Precio Costo *</FormLabel>
                          <Input 
                            type="text"
                            placeholder="0"
                            className="h-10 mt-1.5 font-mono text-sm bg-white border-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            {...form.register(`items.${index}.precio_costo`, { 
                              valueAsNumber: true,
                              setValueAs: (v) => v === '' ? 0 : parseInt(v)
                            })}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              form.setValue(`items.${index}.precio_costo`, parseInt(value) || 0);
                            }}
                          />
                        </div>

                        {/* Eliminar */}
                        <div className="col-span-1 flex justify-end pt-6">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-10 w-10 text-slate-400 hover:bg-red-50 hover:text-red-600"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Fila 2: Detalles */}
                      <div className="grid grid-cols-12 gap-4 items-start">
                        {/* Marca */}
                        <div className="col-span-4">
                          <FormLabel className="text-xs font-medium text-slate-500 uppercase tracking-wide">Marca</FormLabel>
                          <Input 
                            placeholder="Ej: Bosch"
                            className="h-9 mt-1.5 bg-white border-slate-200 text-sm"
                            {...form.register(`items.${index}.marca`)}
                          />
                        </div>

                        {/* Calidad */}
                        <div className="col-span-4">
                          <FormLabel className="text-xs font-medium text-slate-500 uppercase tracking-wide">Calidad</FormLabel>
                          <Input 
                            placeholder="Ej: Cerámica"
                            className="h-9 mt-1.5 bg-white border-slate-200 text-sm"
                            {...form.register(`items.${index}.calidad`)}
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="col-span-4 flex items-end justify-end h-full pb-1">
                          {subtotal > 0 && (
                            <div className="text-right">
                              <span className="text-xs text-slate-500 block mb-1">Subtotal</span>
                              <span className="text-lg font-mono font-bold text-slate-900">
                                ${subtotal.toLocaleString('es-CL')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer: Total y Acciones */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-md p-6 sticky bottom-4 z-40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de la Compra</p>
                <p className="text-4xl font-bold text-slate-900">
                  ${calculatedTotal.toLocaleString('es-CL')}
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg"
                  onClick={() => setLocation("/purchases")}
                  className="px-8 border-slate-300"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  size="lg"
                  className="px-8 shadow-md" 
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    "Guardar Compra"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>

      {/* Modal para crear proveedor */}
      <CreateProviderModal 
        open={createProviderModalOpen}
        onOpenChange={setCreateProviderModalOpen}
        onProviderCreated={(providerName) => {
          form.setValue("proveedor_nombre", providerName);
          setCreateProviderModalOpen(false);
        }}
      />
    </div>
  );
}

// Modal minimalista para crear proveedor
function CreateProviderModal({ 
  open, 
  onOpenChange,
  onProviderCreated 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onProviderCreated: (providerName: string) => void;
}) {
  const createProviderMutation = useCreateProvider();
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      nombre: "",
      telefono: "",
      email: "",
    },
  });

  const onSubmit = (data: any) => {
    const cleanData = {
      nombre: data.nombre,
      ...(data.telefono && { telefono: data.telefono }),
      ...(data.email && { email: data.email }),
    };

    createProviderMutation.mutate(cleanData, {
      onSuccess: (newProvider) => {
        toast({
          title: "Proveedor creado",
          description: `${newProvider.nombre} ha sido agregado`,
          className: "bg-green-600 text-white border-none"
        });
        form.reset();
        onProviderCreated(newProvider.nombre);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "No se pudo crear el proveedor",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Crear proveedor</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              rules={{ required: "El nombre es obligatorio" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Frenos Chile" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefono"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej: +56912345678" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              rules={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email inválido"
                }
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Ej: contacto@proveedor.cl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createProviderMutation.isPending}
                className="flex-1"
              >
                {createProviderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar proveedor"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
