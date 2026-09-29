/**
 * Icon Registry — admin-portal-angular
 *
 * @lucide/angular API: each icon is a standalone Angular Component.
 * Import the component class and use it directly in the `imports` array.
 *
 * Naming: LucideIconName (e.g. LucideUser, LucideBell)
 * Template selector: <lucide-user />, <lucide-bell />, etc.
 *
 * To add a new icon:
 *  1. Find its class name in @lucide/angular (LucideXxx)
 *  2. Add the import below
 *  3. Add it to ICON_COMPONENTS and IconName union
 */
import {
  LucideArrowDown,
  LucideArrowLeft,
  LucideArrowRight,
  LucideArrowUp,
  LucideBell,
  LucideBellOff,
  LucideCalendar,
  LucideCheck,
  LucideCircleAlert,
  LucideCircleCheck,
  LucideChevronDown,
  LucideChevronLeft,
  LucideChevronRight,
  LucideChevronUp,
  LucideChevronsUpDown,
  LucideCircle,
  LucideClock,
  LucideCopy,
  LucideDownload,
  LucideEllipsis,
  LucideEllipsisVertical,
  LucideEye,
  LucideEyeOff,
  LucideFile,
  LucideFileText,
  LucideFlag,
  LucideFolder,
  LucideFolderOpen,
  LucideFunnel,
  LucideGlobe,
  LucideGrid3x3,
  LucideHouse,
  LucideImage,
  LucideInbox,
  LucideInfo,
  LucideKanban,
  LucideKey,
  LucideLanguages,
  LucideLayoutDashboard,
  LucideList,
  LucideLoader,
  LucideLock,
  LucideLogOut,
  LucideMail,
  LucideMenu,
  LucideMonitor,
  LucideMoon,
  LucideOctagonAlert,
  LucidePencil,
  LucidePhone,
  LucidePlus,
  LucideQrCode,
  LucideRefreshCw,
  LucideSearch,
  LucideSettings,
  LucideShield,
  LucideSlidersHorizontal,
  LucideStar,
  LucideSun,
  LucideTrash,
  LucideTrendingDown,
  LucideTrendingUp,
  LucideTriangleAlert,
  LucideUpload,
  LucideUser,
  LucideUsers,
  LucideWifiOff,
  LucideX,
  type LucideIcon,
} from '@lucide/angular';
import type { Type } from '@angular/core';

export type IconName =
  | 'alert-circle'
  | 'alert-octagon'
  | 'alert-triangle'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right'
  | 'arrow-up'
  | 'bell'
  | 'bell-off'
  | 'calendar'
  | 'check'
  | 'check-circle'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'chevrons-up-down'
  | 'circle'
  | 'clock'
  | 'copy'
  | 'download'
  | 'edit'
  | 'ellipsis'
  | 'ellipsis-vertical'
  | 'eye'
  | 'eye-off'
  | 'file'
  | 'file-text'
  | 'filter'
  | 'flag'
  | 'folder'
  | 'folder-open'
  | 'globe'
  | 'grid'
  | 'home'
  | 'image'
  | 'inbox'
  | 'info'
  | 'key'
  | 'languages'
  | 'layout-dashboard'
  | 'list'
  | 'loader'
  | 'lock'
  | 'log-out'
  | 'mail'
  | 'menu'
  | 'monitor'
  | 'moon'
  | 'pencil'
  | 'phone'
  | 'plus'
  | 'qr-code'
  | 'refresh'
  | 'search'
  | 'settings'
  | 'shield'
  | 'sliders'
  | 'star'
  | 'sun'
  | 'trash'
  | 'trending-down'
  | 'trending-up'
  | 'upload'
  | 'user'
  | 'users'
  | 'wifi-off'
  | 'x';

/** Map icon name → Lucide component class */
export const ICON_REGISTRY: Record<IconName, LucideIcon> = {
  'alert-circle':      LucideCircleAlert,
  'alert-octagon':     LucideOctagonAlert,
  'alert-triangle':    LucideTriangleAlert,
  'arrow-down':        LucideArrowDown,
  'arrow-left':        LucideArrowLeft,
  'arrow-right':       LucideArrowRight,
  'arrow-up':          LucideArrowUp,
  'bell':              LucideBell,
  'bell-off':          LucideBellOff,
  'calendar':          LucideCalendar,
  'check':             LucideCheck,
  'check-circle':      LucideCircleCheck,
  'chevron-down':      LucideChevronDown,
  'chevron-left':      LucideChevronLeft,
  'chevron-right':     LucideChevronRight,
  'chevron-up':        LucideChevronUp,
  'chevrons-up-down':  LucideChevronsUpDown,
  'circle':            LucideCircle,
  'clock':             LucideClock,
  'copy':              LucideCopy,
  'download':          LucideDownload,
  'edit':              LucidePencil,
  'ellipsis':          LucideEllipsis,
  'ellipsis-vertical': LucideEllipsisVertical,
  'eye':               LucideEye,
  'eye-off':           LucideEyeOff,
  'file':              LucideFile,
  'file-text':         LucideFileText,
  'filter':            LucideFunnel,
  'flag':              LucideFlag,
  'folder':            LucideFolder,
  'folder-open':       LucideFolderOpen,
  'globe':             LucideGlobe,
  'grid':              LucideGrid3x3,
  'home':              LucideHouse,
  'image':             LucideImage,
  'inbox':             LucideInbox,
  'info':              LucideInfo,
  'key':               LucideKey,
  'languages':         LucideLanguages,
  'layout-dashboard':  LucideLayoutDashboard,
  'list':              LucideList,
  'loader':            LucideLoader,
  'lock':              LucideLock,
  'log-out':           LucideLogOut,
  'mail':              LucideMail,
  'menu':              LucideMenu,
  'monitor':           LucideMonitor,
  'moon':              LucideMoon,
  'pencil':            LucidePencil,
  'phone':             LucidePhone,
  'plus':              LucidePlus,
  'qr-code':           LucideQrCode,
  'refresh':           LucideRefreshCw,
  'search':            LucideSearch,
  'settings':          LucideSettings,
  'shield':            LucideShield,
  'sliders':           LucideSlidersHorizontal,
  'star':              LucideStar,
  'sun':               LucideSun,
  'trash':             LucideTrash,
  'trending-down':     LucideTrendingDown,
  'trending-up':       LucideTrendingUp,
  'upload':            LucideUpload,
  'user':              LucideUser,
  'users':             LucideUsers,
  'wifi-off':          LucideWifiOff,
  'x':                 LucideX,
};

/** All Lucide components — import this in the Icon component */
export const ALL_ICON_COMPONENTS = Object.values(ICON_REGISTRY) as LucideIcon[];
