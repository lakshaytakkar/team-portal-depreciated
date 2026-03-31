import type { ReactNode } from "react";

export const DS = {
  color: {
    accent: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
      muted: "hsl(var(--primary) / 0.1)",
      hover: "hsl(var(--primary) / 0.9)",
    },
    text: {
      DEFAULT: "text-foreground",
      secondary: "text-muted-foreground",
      inverse: "text-primary-foreground",
      link: "text-primary hover:text-primary/80",
      disabled: "text-muted-foreground/50",
    },
    bg: {
      page: "bg-background",
      surface: "bg-card",
      surfaceRaised: "bg-card shadow-sm",
      muted: "bg-muted",
      overlay: "bg-background/80 backdrop-blur-sm",
      input: "bg-input",
    },
    surface: {
      card: "bg-card border rounded-xl",
      popover: "bg-popover border rounded-lg shadow-md",
      sidebar: "bg-sidebar",
      accent: "bg-accent",
    },
    system: {
      success: "hsl(var(--success))",
      successForeground: "hsl(var(--success-foreground))",
      warning: "hsl(var(--warning))",
      warningForeground: "hsl(var(--warning-foreground))",
      info: "hsl(var(--info))",
      infoForeground: "hsl(var(--info-foreground))",
      destructive: "hsl(var(--destructive))",
      destructiveForeground: "hsl(var(--destructive-foreground))",
    },
    border: {
      DEFAULT: "border-border",
      input: "border-input",
      ring: "ring-ring",
    },
    chart: ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"],
    status: {
      online: "rgb(34 197 94)",
      away: "rgb(245 158 11)",
      busy: "rgb(239 68 68)",
      offline: "rgb(156 163 175)",
    },
  },

  font: {
    family: {
      sans: "font-sans",
      heading: "font-heading",
      serif: "font-serif",
      mono: "font-mono",
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    size: {
      xs: "text-xs",
      sm: "text-sm",
      base: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
    },
    leading: {
      tight: "leading-tight",
      snug: "leading-snug",
      normal: "leading-normal",
      relaxed: "leading-relaxed",
    },
  },

  heading: {
    h1: "text-3xl font-bold font-heading tracking-tight",
    h2: "text-2xl font-bold font-heading",
    h3: "text-xl font-semibold font-heading",
    h4: "text-lg font-semibold font-heading",
    h5: "text-base font-semibold",
    h6: "text-sm font-semibold",
  },

  radius: {
    none: "rounded-none",
    sm: "rounded-sm",
    DEFAULT: "rounded-md",
    lg: "rounded-lg",
    xl: "rounded-xl",
    "2xl": "rounded-2xl",
    full: "rounded-full",
    card: "rounded-xl",
    button: "rounded-lg",
    badge: "rounded-full",
    avatar: "rounded-full",
    input: "rounded-md",
  },

  shadow: {
    xs: "shadow-[var(--shadow-xs)]",
    sm: "shadow-[var(--shadow-sm)]",
    md: "shadow-[var(--shadow-md)]",
    lg: "shadow-[var(--shadow-lg)]",
    xl: "shadow-[var(--shadow-xl)]",
    "2xl": "shadow-[var(--shadow-2xl)]",
    btnPrimary: "shadow-btn-primary",
    btnSecondary: "shadow-btn-secondary",
    card: "shadow-[var(--shadow-sm)]",
    dropdown: "shadow-[var(--shadow-lg)]",
    modal: "shadow-[var(--shadow-xl)]",
  },

  page: {
    shell: "px-16 py-6 lg:px-24 space-y-6",
    gap: "space-y-6",
  },

  typography: {
    pageTitle: "text-2xl font-bold font-heading text-foreground",
    pageSubtitle: "mt-0.5 text-sm text-muted-foreground",
    sectionTitle: "text-sm font-semibold",
    sectionLabel: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
    statValue: "text-2xl font-bold font-heading",
    statLabel: "text-xs font-medium text-muted-foreground",
    statTrend: "text-xs text-muted-foreground",
    bodyText: "text-sm text-foreground",
    caption: "text-xs text-muted-foreground",
    heroHeadline: "text-3xl font-bold font-heading tracking-tight",
    heroTagline: "text-sm opacity-75",
    heroEyebrow: "text-sm font-medium opacity-75",
  },

  table: {
    container: "rounded-xl border bg-card overflow-hidden",
    headerRow: "border-b bg-muted/40",
    headerCell: "px-4 py-3 text-xs font-medium text-muted-foreground tracking-wide",
    dataCell: "px-4 py-3.5",
    row: "hover:bg-muted/20 transition-colors",
    rowSelected: "bg-primary/5",
    search: {
      width: "w-60",
      height: "h-8",
      icon: "size-3.5",
      padding: "pl-8",
    },
    filter: {
      height: "h-8",
      minWidth: "min-w-[120px]",
      display: "dropdown" as const,
    },
    pagination: {
      method: "pages" as const,
      pageSize: 10,
      buttonSize: "size-7",
      iconSize: "size-3.5",
      maxVisiblePages: 5,
    },
    empty: {
      padding: "px-4 py-12",
      illustrationSize: "size-28",
      titleStyle: "text-sm font-medium text-foreground",
      descStyle: "max-w-xs text-xs text-muted-foreground",
    },
    checkbox: {
      colWidth: "w-10",
      cellPadding: "px-3 py-2.5",
    },
    actions: {
      colWidth: "w-10",
      buttonSize: "size-7",
      iconSize: "size-3.5",
      menuWidth: "w-36",
    },
    heightMode: "fit-content" as const,
  },

  toolbar: {
    search: {
      width: "w-80",
      height: "h-9",
      icon: "h-4 w-4",
      bg: "bg-muted/30",
      padding: "pl-10",
    },
    gap: "gap-3",
    filterGap: "gap-2",
  },

  pill: {
    base: "rounded-full px-3 py-1 text-xs font-medium transition-colors",
    active: { color: "#fff" },
    inactive: {
      bg: "hsl(var(--muted))",
      color: "hsl(var(--muted-foreground))",
    },
  },

  primaryAction: {
    base: "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50",
    iconSize: "h-4 w-4",
  },

  card: {
    base: "rounded-xl border bg-card",
    stat: {
      padding: "p-5",
      iconBox: "h-9 w-9 rounded-lg",
      iconSize: "h-4 w-4",
    },
    section: {
      headerPadding: "px-5 py-3.5",
      bodyPadding: "p-5",
    },
  },

  grid: {
    stat: {
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    } as Record<number, string>,
    section: {
      2: "grid-cols-1 lg:grid-cols-2",
      3: "grid-cols-1 lg:grid-cols-3",
    } as Record<number, string>,
    gap: "gap-4",
  },

  hero: {
    radius: "rounded-2xl",
    padding: "px-8 py-7",
    metricsGap: "gap-8",
    metricValueSize: "text-2xl",
    metricLabelSize: "text-xs",
  },

  modal: {
    maxWidth: "max-w-2xl",
    headerPadding: "px-6 py-4",
    sectionPadding: "px-6 py-5",
    footerPadding: "px-6 py-4",
    maxBodyHeight: "max-h-[65vh]",
    titleSize: "text-base font-semibold",
    subtitleSize: "text-xs text-muted-foreground",
    footerBg: "bg-muted/30",
  },

  infoRow: {
    padding: "py-1.5",
    labelStyle: "text-sm text-muted-foreground",
    valueStyle: "text-sm font-medium",
  },
} as const;

export type FilterDisplay = "dropdown" | "tag";
export type PaginationMethod = "pages" | "infinite" | "load-more";
export type TableHeight = "fit-content" | "fixed";

export interface TablePageConfig<T = unknown> {
  title: string;
  subtitle?: string;

  fields: {
    key: string;
    header: string;
    type: "text" | "email" | "number" | "date" | "status" | "avatar" | "badge" | "currency" | "custom";
    width?: string;
    sortable?: boolean;
    render?: (item: T) => ReactNode;
  }[];

  search: {
    enabled: boolean;
    searchBy?: string;
    placeholder: string;
  };

  filters: {
    key: string;
    label: string;
    display: FilterDisplay;
    options: string[];
  }[];

  pagination: {
    method: PaginationMethod;
    pageSize: number;
  };

  tableHeight: TableHeight;

  primaryAction?: {
    label: string;
    icon?: string;
  };

  rowActions?: {
    label: string;
    variant?: "default" | "destructive";
    confirmMessage?: string;
  }[];

  emptyState: {
    title: string;
    description: string;
    illustration?: string;
  };
}

export function defineTablePage<T>(config: TablePageConfig<T>): TablePageConfig<T> {
  return {
    ...config,
    search: {
      enabled: true,
      placeholder: "Search...",
      ...config.search,
    },
    pagination: {
      method: "pages",
      pageSize: DS.table.pagination.pageSize,
      ...config.pagination,
    },
    tableHeight: config.tableHeight ?? "fit-content",
    emptyState: {
      title: "No data found",
      description: "There are no records to display.",
      ...config.emptyState,
    },
  };
}
