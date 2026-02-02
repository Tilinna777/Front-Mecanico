import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="pt-6 pb-8">
          <div className="flex mb-4 gap-3 items-center">
            <AlertCircle className="h-10 w-10 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">404 - Página No Encontrada</h1>
              <p className="text-sm text-slate-500">La página que buscas no existe</p>
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-600 mb-6">
            La ruta a la que intentas acceder no está disponible. Verifica la URL o regresa al inicio.
          </p>

          <Button 
            onClick={() => setLocation("/")} 
            className="w-full gap-2"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
