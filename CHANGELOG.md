# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-01-15

### Added
- Initial release of SPA Procurement System
- User authentication via Clerk with role-based access control
- Dashboard with Kanban board view
- Requisition management (create, view, edit, status tracking)
- Product and category catalog
- Location management
- User management for ADMIN
- Activity log for all requisition changes
- Email notifications via Resend
- Slack notifications via webhooks
- File upload support via UploadThing
- Optimistic locking for concurrent updates
- Database schema with Prisma
- Seed script with test data
- Comprehensive API documentation
- Deployment guide for Vercel

### Roles
- **ADMIN**: Full system access, user/location/catalog management
- **PROCUREMENT**: View and manage all requisitions, catalog access
- **REQUESTER**: Create requisitions, view own requisitions

### Status Flow
DRAFT → SUBMITTED → EDITED → ORDERED → PARTIALLY_RECEIVED → RECEIVED → CLOSED

### Tech Stack
- Next.js 14 (App Router)
- TypeScript (Strict mode)
- PostgreSQL + Prisma ORM
- Clerk Authentication
- Tailwind CSS + shadcn/ui
- UploadThing for file uploads
- Resend for emails
- Slack webhooks

## Future Enhancements

### Planned for v1.1
- [ ] CSV export functionality
- [ ] Advanced filtering and search
- [ ] Real-time notifications via WebSockets
- [ ] Mobile-responsive improvements
- [ ] Dark mode support
- [ ] Bulk operations for requisitions
- [ ] Supplier management
- [ ] Inventory tracking
- [ ] Budget management and reporting
- [ ] Analytics dashboard

### Planned for v1.2
- [ ] Multi-language support
- [ ] Advanced reporting and analytics
- [ ] Integration with accounting systems
- [ ] Barcode scanning support
- [ ] Mobile app (React Native)

## Bug Fixes
None reported yet.

## Breaking Changes
None.

