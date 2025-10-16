import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  FileText,
  CheckSquare,
  PieChart,
  Users,
  Settings,
  TrendingUp,
  Calendar,
  Shield
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Navigation = () => {
  const location = useLocation();
  const [myExpensesCount, setMyExpensesCount] = useState<number>(0);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mi total de gastos
      const { count: myCount } = await supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      setMyExpensesCount(myCount || 0);

      // Rol del usuario
      const { data: roleRow } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      const role = roleRow?.role || 'user';
      setUserRole(role);

      // Pendientes para aprobar: si es supervisor/admin todos; si no, solo propios
      const query = supabase
        .from('expenses')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (!(role === 'supervisor' || role === 'admin')) {
        query.eq('user_id', user.id);
      }
      const { count: pendingCount } = await query;
      setPendingApprovalsCount(pendingCount || 0);
    };
    load();
  }, []);
  // moved into hook above

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      active: location.pathname === "/"
    },
    {
      title: "Mis Gastos",
      href: "/expenses",
      icon: FileText,
      badge: myExpensesCount ? String(myExpensesCount) : undefined,
      active: location.pathname === "/expenses"
    },
    {
      title: "Nuevo Gasto",
      href: "/new-expense",
      icon: FileText,
      active: location.pathname === "/new-expense"
    },
    {
      title: "Aprobaciones",
      href: "/approvals",
      icon: CheckSquare,
      badge: pendingApprovalsCount ? String(pendingApprovalsCount) : undefined,
      badgeVariant: "warning" as const,
      active: location.pathname === "/approvals"
    },
    {
      title: "Reportes",
      href: "/reports",
      icon: PieChart,
      active: location.pathname === "/reports"
    },
    {
      title: "Equipo",
      href: "/team",
      icon: Users,
      active: location.pathname === "/team"
    },
    {
      title: "Políticas",
      href: "/policies",
      icon: Shield,
      active: location.pathname === "/policies"
    },
    {
      title: "Configuración",
      href: "/settings",
      icon: Settings,
      active: location.pathname === "/settings"
    }
  ];
    {
      title: "Dashboard",
      href: "/",
      icon: Home,
      active: location.pathname === "/"
    },
    {
      title: "Mis Gastos",
      href: "/expenses",
      icon: FileText,
      badge: "3",
      active: location.pathname === "/expenses"
    },
    {
      title: "Nuevo Gasto",
      href: "/new-expense",
      icon: FileText,
      active: location.pathname === "/new-expense"
    },
    {
      title: "Aprobaciones",
      href: "/approvals",
      icon: CheckSquare,
      badge: "5",
      badgeVariant: "warning" as const,
      active: location.pathname === "/approvals"
    },
    {
      title: "Reportes",
      href: "/reports",
      icon: PieChart,
      active: location.pathname === "/reports"
    },
    {
      title: "Equipo",
      href: "/team",
      icon: Users,
      active: location.pathname === "/team"
    },
    {
      title: "Políticas",
      href: "/policies",
      icon: Shield,
      active: location.pathname === "/policies"
    },
    {
      title: "Configuración",
      href: "/settings",
      icon: Settings,
      active: location.pathname === "/settings"
    }
  ];

  return (
    <nav className="w-64 min-h-screen bg-card border-r border-border">
      <div className="p-6">
        <div className="space-y-2">
          {navigationItems.map((item) => (
            <Link key={item.href} to={item.href}>
              <Button
                variant={item.active ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start h-11 px-3",
                  item.active && "bg-primary text-primary-foreground font-medium"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="flex-1 text-left">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant={item.badgeVariant || "secondary"} 
                    className="ml-auto text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-muted-foreground mb-3 px-3">
            Acciones Rápidas
          </h4>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Resumen Mensual
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <Calendar className="mr-2 h-4 w-4" />
              Próximos Vencimientos
            </Button>
          </div>
        </div>

        {/* Budget Alert */}
        <div className="mt-6 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <h4 className="text-sm font-medium text-warning mb-1">
            Alerta Presupuestaria
          </h4>
          <p className="text-xs text-muted-foreground">
            El departamento de Ventas está al 85% del presupuesto mensual.
          </p>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;