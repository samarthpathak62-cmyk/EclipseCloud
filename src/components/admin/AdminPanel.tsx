import React, { useState } from 'react';
import { AdminLayout, AdminSection } from './AdminLayout';
import { AdminDashboardTab } from './AdminDashboardTab';
import { AdminPlansTab } from './AdminPlansTab';
import { AdminCategoriesTab } from './AdminCategoriesTab';
import { AdminWebsiteSettingsTab } from './AdminWebsiteSettingsTab';
import { AdminDiscordSettingsTab } from './AdminDiscordSettingsTab';
import { AdminHomepageCmsTab } from './AdminHomepageCmsTab';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminRolesTab } from './AdminRolesTab';
import { AdminNotificationsTab } from './AdminNotificationsTab';
import { AdminSupportTab } from './AdminSupportTab';
import { AdminLogsTab } from './AdminLogsTab';

interface AdminPanelProps {
  onExitToWebsite: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExitToWebsite }) => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');

  return (
    <AdminLayout
      currentSection={currentSection}
      setCurrentSection={setCurrentSection}
      onExitToWebsite={onExitToWebsite}
    >
      {currentSection === 'dashboard' && (
        <AdminDashboardTab onNavigate={(sec) => setCurrentSection(sec)} />
      )}
      {currentSection === 'plans' && <AdminPlansTab />}
      {currentSection === 'categories' && <AdminCategoriesTab />}
      {currentSection === 'website-settings' && <AdminWebsiteSettingsTab />}
      {currentSection === 'discord-settings' && <AdminDiscordSettingsTab />}
      {currentSection === 'homepage-cms' && <AdminHomepageCmsTab />}
      {currentSection === 'users' && <AdminUsersTab />}
      {currentSection === 'admins-roles' && <AdminRolesTab />}
      {currentSection === 'notifications' && <AdminNotificationsTab />}
      {currentSection === 'support' && <AdminSupportTab />}
      {currentSection === 'logs' && <AdminLogsTab />}
    </AdminLayout>
  );
};
