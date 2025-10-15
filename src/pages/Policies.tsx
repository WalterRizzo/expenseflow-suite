import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, DollarSign, FileText, Clock, CheckCircle } from "lucide-react";

const Policies = () => {
  const policies = [
    {
      title: "Límites de Gastos por Categoría",
      icon: DollarSign,
      items: [
        { category: "Comidas y Entretenimiento", limit: "$500", color: "success" },
        { category: "Viajes y Alojamiento", limit: "$2,000", color: "success" },
        { category: "Transporte", limit: "$300", color: "success" },
        { category: "Suministros de Oficina", limit: "$200", color: "success" },
        { category: "Software y Licencias", limit: "$1,000", color: "success" },
        { category: "Formación", limit: "$800", color: "success" }
      ]
    },
    {
      title: "Requisitos de Documentación",
      icon: FileText,
      items: [
        { requirement: "Factura o ticket original", status: "Obligatorio" },
        { requirement: "Descripción detallada del gasto", status: "Obligatorio" },
        { requirement: "Fecha del gasto", status: "Obligatorio" },
        { requirement: "Categoría asignada", status: "Obligatorio" },
        { requirement: "Justificación de negocio", status: "Recomendado" }
      ]
    },
    {
      title: "Plazos de Presentación",
      icon: Clock,
      items: [
        { period: "Gastos diarios", deadline: "Dentro de 7 días" },
        { period: "Gastos de viaje", deadline: "Dentro de 14 días" },
        { period: "Gastos mensuales", deadline: "Antes del día 5 del mes siguiente" },
        { period: "Gastos anuales", deadline: "Antes del 31 de enero" }
      ]
    },
    {
      title: "Proceso de Aprobación",
      icon: CheckCircle,
      items: [
        { step: "1. Supervisor Directo", amount: "Todos los gastos" },
        { step: "2. Director Financiero", amount: "Gastos > $500" },
        { step: "3. Director General", amount: "Gastos > $1,000" },
        { step: "4. Junta Directiva", amount: "Gastos > $5,000" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Políticas de Gastos</h1>
            <p className="text-muted-foreground mt-1">Normas y directrices para la gestión de gastos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {policies.map((policy, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <policy.icon className="h-5 w-5 text-primary" />
                  {policy.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {policy.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                      <span className="text-sm font-medium">
                        {(item as any).category || (item as any).requirement || (item as any).period || (item as any).step}
                      </span>
                      <Badge variant="secondary">
                        {(item as any).limit || (item as any).status || (item as any).deadline || (item as any).amount}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Importante</h3>
            <p className="text-sm text-muted-foreground">
              El incumplimiento de estas políticas puede resultar en el rechazo automático de los gastos y medidas disciplinarias. 
              Todos los empleados son responsables de conocer y cumplir con estas directrices.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Policies;