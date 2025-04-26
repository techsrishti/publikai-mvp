declare module 'lucide-react' {
  import { ComponentType } from 'react'

  interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string
    color?: string
    strokeWidth?: number | string
  }

  // Navigation and UI Icons
  export const Home: ComponentType<IconProps>
  export const Upload: ComponentType<IconProps>
  export const Play: ComponentType<IconProps>
  export const Settings: ComponentType<IconProps>
  export const Bell: ComponentType<IconProps>
  export const User: ComponentType<IconProps>
  export const FileText: ComponentType<IconProps>
  export const Loader2: ComponentType<IconProps>
  export const Server: ComponentType<IconProps>
  export const Brain: ComponentType<IconProps>
  export const Cpu: ComponentType<IconProps>
  export const BarChart: ComponentType<IconProps>
  export const Users: ComponentType<IconProps>
  export const ArrowRight: ComponentType<IconProps>
  export const ArrowLeft: ComponentType<IconProps>
  export const Info: ComponentType<IconProps>
  export const LinkIcon: ComponentType<IconProps>
  export const X: ComponentType<IconProps>
  export const CheckCircle: ComponentType<IconProps>
  export const AlertCircle: ComponentType<IconProps>
  export const ChevronDown: ComponentType<IconProps>
  export const ChevronUp: ComponentType<IconProps>
  export const ChevronRight: ComponentType<IconProps>
  export const ChevronLeft: ComponentType<IconProps>
  export const MoreHorizontal: ComponentType<IconProps>
  export const Check: ComponentType<IconProps>
  export const Circle: ComponentType<IconProps>
  export const Search: ComponentType<IconProps>
  export const Dot: ComponentType<IconProps>
  export const GripVertical: ComponentType<IconProps>
  export const PanelLeft: ComponentType<IconProps>
  // Add other icons as needed
} 