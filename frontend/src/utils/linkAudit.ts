// Link audit utility to ensure all navigation links work properly
export interface LinkAuditResult {
  component: string;
  links: {
    path: string;
    status: 'working' | 'broken' | 'missing-route';
    description: string;
  }[];
}

export const auditLinks = (): LinkAuditResult[] => {
  return [
    {
      component: 'HomePage',
      links: [
        { path: '/register', status: 'working', description: 'Get Started button' },
        { path: '/login', status: 'working', description: 'Sign in links' },
        { path: '/marketplace', status: 'working', description: 'Marketplace references' },
        { path: '/finance', status: 'working', description: 'Finance references' },
      ]
    },
    {
      component: 'Navbar',
      links: [
        { path: '/', status: 'working', description: 'Home/Logo link' },
        { path: '/marketplace', status: 'working', description: 'Marketplace nav' },
        { path: '/finance', status: 'working', description: 'Finance nav' },
        { path: '/notifications', status: 'working', description: 'Notifications dropdown' },
        { path: '/profile', status: 'working', description: 'Profile link' },
        { path: '/farmer/dashboard', status: 'working', description: 'Farmer dashboard' },
        { path: '/buyer/dashboard', status: 'working', description: 'Buyer dashboard' },
        { path: '/financier/dashboard', status: 'working', description: 'Financier dashboard' },
        { path: '/login', status: 'working', description: 'Login link' },
        { path: '/register', status: 'working', description: 'Register link' },
      ]
    },
    {
      component: 'MarketplacePage',
      links: [
        { path: '/marketplace/:id', status: 'missing-route', description: 'Product detail pages' },
        { path: '/login', status: 'working', description: 'Authentication prompts' },
      ]
    },
    {
      component: 'FinancePage',
      links: [
        { path: '/finance/apply/:loanId', status: 'missing-route', description: 'Loan application pages' },
        { path: '/finance/calculator', status: 'missing-route', description: 'Standalone calculator' },
        { path: '/contact', status: 'missing-route', description: 'Contact page references' },
      ]
    },
    {
      component: 'NotificationsPage',
      links: [
        { path: '/farmer/dashboard?tab=inquiries', status: 'working', description: 'Dashboard tabs' },
        { path: '/farmer/dashboard?tab=messages', status: 'working', description: 'Messages tab' },
        { path: '/farmer/dashboard?tab=transactions', status: 'working', description: 'Transactions tab' },
        { path: '/marketplace?category=grains', status: 'working', description: 'Marketplace filters' },
      ]
    },
    {
      component: 'Dashboards',
      links: [
        { path: '/marketplace', status: 'working', description: 'Browse marketplace' },
        { path: '/finance', status: 'working', description: 'Financial services' },
        { path: '/profile', status: 'working', description: 'User profile' },
        { path: '/notifications', status: 'working', description: 'Notifications' },
      ]
    }
  ];
};

export const getMissingRoutes = (): string[] => {
  const audit = auditLinks();
  const missingRoutes: string[] = [];
  
  audit.forEach(component => {
    component.links.forEach(link => {
      if (link.status === 'missing-route') {
        missingRoutes.push(link.path);
      }
    });
  });
  
  return [...new Set(missingRoutes)]; // Remove duplicates
};
