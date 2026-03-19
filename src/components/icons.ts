/**
 * BMR icon registry — maps all semantic names from the design system to Lucide icons.
 * Source of truth: BMR_Icon_Reference.xlsx (Lucide ↔ SF Symbols mapping)
 *
 * Import named exports for typed usage in components, or use `iconMap` for string-based
 * lookup (e.g. in MDX via the <Icon name="..." /> component).
 */
export {
  // Navigation
  House as IconHome,
  SquareCheckBig as IconMyTasks,
  CirclePlus as IconAddNew,
  BookOpen as IconLibrary,
  Shapes as IconCatalog,
  Ellipsis as IconMore,

  // Spaces
  Landmark as IconOrganization,
  Building2 as IconLocation,
  Box as IconRoom,
  LandPlot as IconMarker,
  Camera as IconPhoto,
  Rotate3d as Icon3DARDesign,

  // Features
  Package as IconEquipment,
  AudioLines as IconAcoustics,
  Scan as IconScan,

  // Actions
  RefreshCw as IconSyncNow,
  ListFilter as IconFilter,
  Search as IconSearch,
  Link as IconLink,
  Info as IconInfo,
  Circle as IconUnchecked,
  Check as IconCheckmark,
  X as IconClose,
  Copy as IconCopyDuplicate,
  Download as IconExport,
  Archive as IconArchive,
  Trash as IconRemoveDelete,
  Pencil as IconEditRename,
  SquarePen as IconEdit2,
  CheckCheck as IconMarkAllRead,
  Ruler as IconRuler,

  // Navigation chevrons
  ChevronDown as IconChevronDown,
  ChevronRight as IconChevronRight,
  ChevronUp as IconChevronUp,
  ChevronLeft as IconChevronLeft,

  // Content
  List as IconActivityLog,
  MessageCircle as IconComments,
  Lock as IconPermissionsLock,
  Bell as IconPermissionsBell,
  FileText as IconTermsOfService,
  Shield as IconPrivacyPolicy,

  // Settings & account
  WifiOff as IconOfflineMode,
  Settings as IconAdminSettings,
  User as IconUser,
  UserCheck as IconUserCheck,
  LogOut as IconLogout,
  Mail as IconMail,
  Palette as IconStudio,
  Copy as IconDigitalTwin,
  RefreshCw as IconLifecycle,
  LayoutPanelLeft as IconLayout,

  // Docs / content sections
  Key as IconKey,
  Smartphone as IconSmartphone,
  CircleCheck as IconCircleCheck,
  Laptop as IconLaptop,
  MapPin as IconMapPin,
  Volume2 as IconVolume2,
  Monitor as IconMonitor,
  Wrench as IconWrench,
  Users as IconUsers,
  Puzzle as IconPuzzle,
  Globe as IconGlobe,
  AlertTriangle as IconAlertTriangle,
  HelpCircle as IconHelpCircle,
  Star as IconStar,
} from "lucide-react";

/**
 * String-keyed map for use with the <Icon name="..." /> component.
 * Keys match the semantic names from the BMR design system (kebab-case).
 * Source: BMR_Icon_Reference.xlsx
 */
import {
  House, SquareCheckBig, CirclePlus, BookOpen, Shapes, Ellipsis,
  Landmark, Building2, Box, LandPlot, Camera, Rotate3d,
  Package, AudioLines, Scan,
  RefreshCw, ListFilter, Search, Link, Info, Circle, Check, X, Copy, Download,
  Archive, Trash, Pencil, SquarePen, CheckCheck, Ruler,
  ChevronDown, ChevronRight, ChevronUp, ChevronLeft,
  List, MessageCircle, Lock, Bell, FileText, Shield,
  WifiOff, Settings, User, UserCheck, LogOut, Mail, Palette, LayoutPanelLeft,
  Key, Smartphone, CircleCheck, Laptop, MapPin, Volume2, Monitor,
  Wrench, Users, Puzzle, Globe, AlertTriangle, HelpCircle, Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  // Navigation
  "home": House,
  "my-tasks": SquareCheckBig,
  "add-new": CirclePlus,
  "library": BookOpen,
  "catalog": Shapes,
  "more": Ellipsis,

  // Spaces
  "organization": Landmark,
  "location": Building2,
  "room": Box,
  "marker": LandPlot,
  "photo": Camera,
  "3d-ar-design": Rotate3d,
  "design": Rotate3d,
  "rotate-3d": Rotate3d,

  // Features
  "equipment": Package,
  "acoustics": AudioLines,
  "audio-lines": AudioLines,
  "scan": Scan,

  // Actions
  "sync-now": RefreshCw,
  "filter": ListFilter,
  "search": Search,
  "link": Link,
  "info": Info,
  "unchecked": Circle,
  "checkmark": Check,
  "close": X,
  "copy": Copy,
  "export": Download,
  "archive": Archive,
  "delete": Trash,
  "edit-rename": Pencil,
  "edit": SquarePen,
  "mark-all-read": CheckCheck,
  "ruler": Ruler,

  // Chevrons
  "chevron-down": ChevronDown,
  "chevron-right": ChevronRight,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,

  // Content
  "activity-log": List,
  "comments": MessageCircle,
  "permissions": Lock,
  "notifications": Bell,
  "terms-of-service": FileText,
  "privacy-policy": Shield,

  // Settings & account
  "offline-mode": WifiOff,
  "admin-settings": Settings,
  "user": User,
  "user-check": UserCheck,
  "logout": LogOut,
  "mail": Mail,
  "palette": Palette,
  "studio": Palette,
  "digital-twin": Copy,
  "lifecycle": RefreshCw,
  "layout": LayoutPanelLeft,
  "layout-panel-left": LayoutPanelLeft,

  // Docs / content sections
  "key": Key,
  "smartphone": Smartphone,
  "circle-check": CircleCheck,
  "laptop": Laptop,
  "map-pin": MapPin,
  "volume-2": Volume2,
  "monitor": Monitor,
  "wrench": Wrench,
  "users": Users,
  "puzzle": Puzzle,
  "globe": Globe,
  "alert-triangle": AlertTriangle,
  "help-circle": HelpCircle,
  "star": Star,
};
