export interface WebsiteSettings {
  websiteName: string;
  logoText?: string;
  logoUrl?: string;
  faviconUrl?: string;
  description: string;
  browserTitle: string;
  seoDescription: string;
  footerText: string;
  copyrightText: string;
  serverNodeCount?: string;
  uptimeGuarantee?: string;
  activePlayersEstimate?: string;
  supportEmail?: string;
  primaryDiscordLink?: string;
  supportDiscordLink?: string;
}

export interface DiscordSettings {
  mainInviteUrl: string;
  supportInviteUrl: string;
  orderInviteUrl: string;
  buttonText: string;
  serverName: string;
  iconUrl?: string;
  description: string;
  memberCountEstimate?: string;
}

export interface HomepageConfig {
  heroHeading: string;
  heroSubheading: string;
  heroDescription: string;
  heroCtaText: string;
  heroCtaLink?: string;
  heroDiscordText: string;
  heroBackgroundUrl?: string;
  heroVisible: boolean;
  whyChooseUsTitle?: string;
  whyChooseUsDescription?: string;
  featuresTitle?: string;
  featuresSubtitle?: string;
  faqTitle?: string;
  faqSubtitle?: string;
  reviewsTitle?: string;
  reviewsSubtitle?: string;
  ctaBannerHeading?: string;
  ctaBannerText?: string;
  ctaBannerButtonText?: string;
}

export interface HostingPlan {
  id: string;
  name: string;
  category: string;
  price: number | string;
  currency: string;
  billingPeriod: string;
  ram: string;
  cpu: string;
  storage: string;
  description: string;
  features: string[];
  badge?: string;
  icon?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  displayOrder: number;
  active: boolean;
  discordCtaText?: string;
  discordDestination?: string;
  createdDate?: string;
  updatedDate?: string;
}

export interface PlanCategory {
  id: string;
  name: string;
  slug?: string;
  description: string;
  icon?: string;
  displayOrder: number;
  active: boolean;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  displayOrder: number;
  active: boolean;
  badge?: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  displayOrder: number;
  active: boolean;
}

export interface ReviewItem {
  id: string;
  authorName: string;
  authorRole: string;
  rating: number;
  reviewText: string;
  avatarUrl?: string;
  verified: boolean;
  active: boolean;
  displayOrder: number;
}

export interface Announcement {
  id: string;
  title?: string;
  text: string;
  link?: string;
  linkUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  type?: 'info' | 'warning' | 'success' | 'alert';
  active: boolean;
  displayOrder?: number;
  createdDate?: string;
}

export interface SocialLinks {
  discord: string;
  twitter: string;
  youtube: string;
  github: string;
  tiktok?: string;
  instagram: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  disabled?: boolean;
  status?: 'Active' | 'Suspended';
  role: 'user' | 'admin' | 'superadmin' | 'owner';
  phoneNumber?: string;
  interestedPlansCount?: number;
}

export type AdminRole = 'Owner' | 'Super Admin' | 'Admin' | 'Moderator' | 'Support';
export type AdminRoleType = AdminRole;

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  permissions: string[];
  assignedBy?: string;
  assignedAt?: string;
  createdAt?: string;
  lastLogin?: string;
  disabled?: boolean;
}

export interface AdminRoleDefinition {
  id: string;
  name: AdminRole;
  description: string;
  permissions: string[];
  isSystem?: boolean;
}

export interface OrderRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  planPrice: string | number;
  planCurrency: string;
  planRam: string;
  planCpu: string;
  planStorage: string;
  category: string;
  status: 'Inquiry Sent' | 'Pending Discord' | 'Pending Discord Ticket' | 'Active on Discord' | 'Cancelled' | 'Closed';
  notes?: string;
  createdAt: string;
  discordInviteUsed: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category?: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Answered' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  updatedAt?: string;
  isPermanentlyClosed?: boolean;
  responses?: {
    id: string;
    sender: string;
    senderRole: string;
    message: string;
    timestamp: string;
  }[];
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  target?: 'all' | string;
  targetUserId?: string;
  targetUserEmail?: string;
  userId?: string;
  readBy?: string[];
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  actorId?: string;
  actorEmail: string;
  actorRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actorId?: string;
  actorEmail: string;
  action: string;
  targetCollection: string;
  targetDocId?: string;
  documentId?: string;
  previousValue?: string;
  newValue?: string;
  timestamp: string;
}
