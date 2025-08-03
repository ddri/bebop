// Centralized icon system to optimize bundle size
// Only import the icons we actually use

import {
  Activity,
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  CommandIcon,
  Copy,
  Delete,
  Download,
  Edit,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Globe,
  Hash,
  Home,
  Link,
  List,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  Search as SearchIcon,
  Settings,
  Shield,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Upload,
  User,
  X,
  XCircle,
  Zap,
} from 'lucide-react';

// Export all commonly used icons from a single place
export const Icons = {
  // Navigation & Layout
  calendar: Calendar,
  plus: Plus,
  moreHorizontal: MoreHorizontal,
  menu: Menu,
  home: Home,
  x: X,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,

  // Content & Files
  fileText: FileText,
  edit: Edit,
  edit3: Edit3,
  delete: Delete,
  trash2: Trash2,
  copy: Copy,
  save: Save,

  // Actions
  target: Target,
  list: List,
  filter: Filter,
  search: SearchIcon,
  refresh: RefreshCw,
  link: Link,
  externalLink: ExternalLink,
  upload: Upload,
  download: Download,

  // Status & Feedback
  clock: Clock,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  alertCircle: AlertCircle,
  activity: Activity,
  timer: Timer,

  // User & Account
  user: User,
  eye: Eye,
  eyeOff: EyeOff,
  settings: Settings,
  shield: Shield,

  // Communication
  mail: Mail,
  bell: Bell,

  // Data & Analytics
  trendingUp: TrendingUp,

  // Utility
  zap: Zap,
  hash: Hash,
  globe: Globe,
  command: CommandIcon,
} as const;

// Type for icon names
export type IconName = keyof typeof Icons;

// Icon component wrapper for consistent styling
interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
}

export const Icon = ({ name, className, size }: IconProps) => {
  const IconComponent = Icons[name];
  const sizeClass = size ? { width: size, height: size } : {};

  return <IconComponent className={className} style={sizeClass} />;
};
