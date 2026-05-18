'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/lib/store/useSidebarStore';
import { LayoutDashboard, FolderKanban, UploadCloud, FileBarChart, Settings, Menu, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/uploads', label: 'Uploads', icon: UploadCloud },
  { href: '/processing', label: 'Processing', icon: Activity },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { isOpen, toggle } = useSidebarStore();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'relative hidden h-screen border-r bg-background transition-all duration-300 md:block',
        isOpen ? 'w-64' : 'w-20'
      )}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {isOpen && <span className="font-bold text-lg text-primary">ATCC Platform</span>}
        <Button variant="ghost" size="icon" onClick={toggle} className="ml-auto">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <nav className="space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              title={!isOpen ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {isOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
