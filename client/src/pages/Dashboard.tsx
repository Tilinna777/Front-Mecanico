import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLowStockReport, useDailyCashReport, useGlobalSearch } from "@/hooks/use-reports";
import { Package, ShoppingCart, Wrench, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Search as SearchIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  
  const { data: lowStockReport, isLoading: loadingStock } = useLowStockReport();
  const { data: cashReport, isLoading: loadingCash } = useDailyCashReport();
  const { data: searchResults } = useGlobalSearch(searchQuery);

  const lowStockProducts = lowStockReport?.productos || [];
  const totalProductos = lowStockReport?.total_alertas || 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description={`Bienvenido, ${user?.nombre || 'Usuario'}`}
      />

      {/* Buscador Global */}
      <div className="card-industrial bg-white p-6 space-y-4">
        <div className="relative">
          {!searchFocused && !searchQuery && (
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          )}
          <Input 
            placeholder=""
            className="bg-slate-50 border-slate-200 rounded-lg h-12 text-base pl-14"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        
        {searchResults && searchQuery.length >= 2 && searchResults.total_resultados > 0 && (
          <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
            {searchResults.clientes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Clientes ({searchResults.clientes.length})</p>
                {searchResults.clientes.map(cliente => (
                  <div key={cliente.id} className="p-2 bg-white rounded border hover:bg-slate-50 cursor-pointer">
                    <p className="font-medium">{cliente.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {cliente.rut} • {cliente.telefono} • {cliente.cantidad_ordenes} órdenes
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.vehiculos.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Vehículos ({searchResults.vehiculos.length})</p>
                {searchResults.vehiculos.map(vehiculo => (
                  <div key={vehiculo.id} className="p-2 bg-white rounded border hover:bg-slate-50 cursor-pointer">
                    <p className="font-medium font-mono">{vehiculo.patente}</p>
                    <p className="text-xs text-muted-foreground">
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.anio})
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {searchResults.ordenes_recientes.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-2">Órdenes Recientes ({searchResults.ordenes_recientes.length})</p>
                {searchResults.ordenes_recientes.map(orden => (
                  <div key={orden.id} className="p-2 bg-white rounded border hover:bg-slate-50 cursor-pointer">
                    <p className="font-medium">OT #{orden.numero_orden} - {orden.cliente_nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {orden.patente} • ${orden.total.toLocaleString('es-CL')} • {new Date(orden.fecha).toLocaleDateString('es-CL')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {searchQuery.length >= 2 && searchResults && searchResults.total_resultados === 0 && (
          <p className="mt-4 text-sm text-muted-foreground text-center">No se encontraron resultados</p>
        )}
      </div>

      {/* Alertas de Stock Bajo */}
      {loadingStock ? (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Cargando alertas de stock...</span>
            </div>
          </CardContent>
        </Card>
      ) : lowStockProducts.length > 0 ? (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-bold">⚠️ Alerta de Stock Bajo</AlertTitle>
          <AlertDescription>
            <p className="mb-2">{lowStockProducts.length} producto(s) requieren reposición:</p>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.slice(0, 5).map((product) => (
                <Badge key={product.id} variant="destructive" className="font-mono">
                  {product.sku} - {product.stock_actual}/{product.stock_minimo} u.
                </Badge>
              ))}
              {lowStockProducts.length > 5 && (
                <Badge variant="outline">+{lowStockProducts.length - 5} más</Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      ) : null}

      {/* Cards de Caja Diaria */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taller (Hoy)</CardTitle>
            <Wrench className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {loadingCash ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">${cashReport?.total_taller.toLocaleString('es-CL') || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {cashReport?.cantidad_ordenes || 0} órdenes
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesón (Hoy)</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loadingCash ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">${cashReport?.total_meson.toLocaleString('es-CL') || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {cashReport?.cantidad_ventas_meson || 0} ventas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Día</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loadingCash ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">${cashReport?.total_final.toLocaleString('es-CL') || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {new Date(cashReport?.fecha || '').toLocaleDateString('es-CL')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {loadingStock ? (
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{lowStockReport?.total_alertas || 0}</div>
                <p className="text-xs text-muted-foreground">
                  productos
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Acciones Rápidas
          </CardTitle>
          <CardDescription>Accede rápidamente a las funciones principales</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => window.location.href = '/work-orders'}
            >
              <Wrench className="w-6 h-6" />
              <span className="font-semibold">Nueva Orden de Trabajo</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={() => window.location.href = '/inventory'}
            >
              <Package className="w-6 h-6" />
              <span className="font-semibold">Ver Inventario</span>
            </Button>
            
            {user?.role === 'ADMIN' || user?.role === 'administrador' ? (
              <Button 
                variant="outline" 
                className="h-auto py-4 flex-col gap-2"
                onClick={() => window.location.href = '/purchases'}
              >
                <ShoppingCart className="w-6 h-6" />
                <span className="font-semibold">Registrar Compra</span>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
