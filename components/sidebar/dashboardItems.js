import {
  Archive,
  Book,
  Bookmark,
  BookOpen,
  Briefcase,
  CreditCard,
  FilePlus,
  Grid,
  Home,
  Inbox,
  Layers,
  Package,
  Thermometer,
  Truck,
  User,
  UserCheck,
  Tool,
} from "react-feather";

const pagesSection = [
  {
    href: "/usuarios",
    icon: User,
    title: "Usuarios",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/campos",
    icon: Home,
    title: "Campos",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/rubros",
    icon: Book,
    title: "Rubros",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/sectores",
    icon: Layers,
    title: "Sectores",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/variedades",
    icon: Bookmark,
    title: "Variedades",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/muestras",
    icon: Thermometer,
    title: "Muestras",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/cargos",
    icon: Tool,
    title: "Cargos",
    profile: ["Administrador"],
    // badge: "8",
  },
  {
    href: "/proveedores",
    icon: Briefcase,
    title: "Proveedores",
    profile: ["Administrador"],
    // badge: "8",
  },
  // {
  //   href: "/cargos",
  //   icon: UserCheck,
  //   title: "Cargos",
  //   profile: ["Administrador"],
  //   // badge: "8",
  // },
  // {
  //   href: "/proveedores",
  //   icon: Truck,
  //   title: "Proveedores",
  //   profile: ["Administrador"],
  //   // badge: "8",
  // },
  // {
  //   href: "/etiquetas",
  //   icon: Tag,
  //   title: "Etiquetas",
  //   profile: ["Administrador"],
  //   // badge: "8",
  // },

  {
    href: "/servicios",
    icon: FilePlus,
    title: "Valor Servicios",
    profile: ["Manager"],
    // badge: "8",
  },
  {
    href: "/pagos",
    icon: CreditCard,
    title: "Pagos",
    profile: ["Manager"],
    // badge: "8",
  },
  {
    href: "/recibos",
    icon: Inbox,
    title: "Recibos",
    profile: ["Manager"],
    // badge: "8",
  },
  {
    href: "/dashboard",
    icon: Archive,
    title: "Dashboard",
    profile: ["Manager"],
    // badge: "8",
  },
  {
    href: "/perfil",
    icon: User,
    title: "Mis Datos",
    profile: ["Manager"],
    // badge: "8",
  },
];

const elementsSection = [
  {
    href: "/components",
    icon: Grid,
    title: "Components",
    children: [
      {
        href: "/components/alerts",
        title: "Alerts",
      },
    ],
  },
];

const docsSection = [
  {
    href: "/changelog",
    title: "",
    badge: "v3.2.1",
  },
];

const navItems = [
  {
    title: "Principal",
    pages: pagesSection,
  },
];

export default navItems;
