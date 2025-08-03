'use client';

import { UserButton } from '@repo/auth/client';
import { ModeToggle } from '@repo/design-system/components/mode-toggle';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@repo/design-system/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@repo/design-system/components/ui/sidebar';
import { cn } from '@repo/design-system/lib/utils';
import { NotificationsTrigger } from '@repo/notifications/components/trigger';
import {
  BookOpenIcon,
  CalendarIcon,
  ChevronRightIcon,
  LifeBuoyIcon,
  MegaphoneIcon,
  PenToolIcon,
  PieChartIcon,
  SendIcon,
  Settings2Icon,
} from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Search } from './search';

type GlobalSidebarProperties = {
  readonly children: ReactNode;
};

const data = {
  user: {
    name: 'Bebop User',
    email: 'user@bebop.com',
    avatar: '/avatars/user.jpg',
  },
  navMain: [
    {
      title: 'Campaigns',
      url: '/',
      icon: MegaphoneIcon,
      isActive: true,
      items: [
        {
          title: 'All Campaigns',
          url: '/',
        },
        {
          title: 'Draft',
          url: '/?status=DRAFT',
        },
        {
          title: 'Active',
          url: '/?status=ACTIVE',
        },
        {
          title: 'Completed',
          url: '/?status=COMPLETED',
        },
      ],
    },
    {
      title: 'Scheduled Content',
      url: '/scheduled',
      icon: CalendarIcon,
      items: [
        {
          title: 'Calendar View',
          url: '/scheduled',
        },
        {
          title: 'Pending',
          url: '/scheduled?status=PENDING',
        },
        {
          title: 'Publishing',
          url: '/scheduled?status=PUBLISHING',
        },
        {
          title: 'Published',
          url: '/scheduled?status=PUBLISHED',
        },
      ],
    },
    {
      title: 'Content Library',
      url: '/content',
      icon: PenToolIcon,
      items: [
        {
          title: 'All Content',
          url: '/content',
        },
        {
          title: 'Blog Posts',
          url: '/content?type=BLOG_POST',
        },
        {
          title: 'Social Posts',
          url: '/content?type=SOCIAL_POST',
        },
        {
          title: 'Emails',
          url: '/content?type=EMAIL',
        },
      ],
    },
    {
      title: 'Analytics',
      url: '/analytics',
      icon: PieChartIcon,
      items: [
        {
          title: 'Overview',
          url: '/analytics',
        },
        {
          title: 'Campaigns',
          url: '/analytics/campaigns',
        },
        {
          title: 'Content',
          url: '/analytics/content',
        },
      ],
    },
    {
      title: 'Destinations',
      url: '/destinations',
      icon: SendIcon,
      items: [
        {
          title: 'All Destinations',
          url: '/destinations',
        },
        {
          title: 'Social Media',
          url: '/destinations/social',
        },
        {
          title: 'Email',
          url: '/destinations/email',
        },
        {
          title: 'Websites',
          url: '/destinations/websites',
        },
      ],
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings2Icon,
      items: [
        {
          title: 'General',
          url: '/settings',
        },
        {
          title: 'API Keys',
          url: '/settings/api',
        },
        {
          title: 'Notifications',
          url: '/settings/notifications',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Documentation',
      url: '#',
      icon: BookOpenIcon,
    },
    {
      title: 'Support',
      url: '#',
      icon: LifeBuoyIcon,
    },
    {
      title: 'Feedback',
      url: '#',
      icon: SendIcon,
    },
  ],
};

export const GlobalSidebar = ({ children }: GlobalSidebarProperties) => {
  const sidebar = useSidebar();

  return (
    <>
      <Sidebar variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div
                className={cn(
                  'h-[36px] overflow-hidden transition-all [&>div]:w-full',
                  sidebar.open ? '' : '-mx-1'
                )}
              >
                <div className="flex items-center gap-2 px-2 py-1">
                  <div className="h-6 w-6 rounded-full bg-primary" />
                  <span className="font-medium text-sm">Personal</span>
                </div>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <Search />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={item.isActive}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuAction className="data-[state=open]:rotate-90">
                            <ChevronRightIcon />
                            <span className="sr-only">Toggle</span>
                          </SidebarMenuAction>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items?.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <Link href={subItem.url}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <UserButton
                showName
                appearance={{
                  elements: {
                    rootBox: 'flex overflow-hidden w-full',
                    userButtonBox: 'flex-row-reverse',
                    userButtonOuterIdentifier: 'truncate pl-0',
                  },
                }}
              />
              <div className="flex shrink-0 items-center gap-px">
                <ModeToggle />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  asChild
                >
                  <div className="h-4 w-4">
                    <NotificationsTrigger />
                  </div>
                </Button>
              </div>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>{children}</SidebarInset>
    </>
  );
};
