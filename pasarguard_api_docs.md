# Pasarguard (Marzban) API Capabilities Guide

Pasarguard is built on the Marzban API. Below is a comprehensive list of all capabilities exposed by the REST API, grouped by functionality.

## 1. Authentication & Security
- **Admin Token (`POST /api/admin/token`)**: Generate an OAuth2 access token using admin credentials.
- **Admin Management**:
  - `GET /api/admin`: List all admins.
  - `POST /api/admin`: Create a new admin.
  - `PUT /api/admin/{username}`: Update admin details.
  - `DELETE /api/admin/{username}`: Remove an admin.
- **Password Management**: Update admin or user passwords via dedicated endpoints.

## 2. User Management (Core)
- **Create User (`POST /api/user`)**: Create a new VPN account with:
  - Custom data limits (total/daily).
  - Expiration dates.
  - Protocol settings (VLESS, VMESS, Trojan, Shadowsocks).
  - Assigned Groups for node access control.
- **User Retrieval**:
  - `GET /api/user/{username}`: Get detailed stats and settings for a specific user.
  - `GET /api/users`: List users with advanced filtering (status, group, search).
  - `GET /api/user/usage`: Fetch real-time usage data.
- **User Modification**:
  - `PUT /api/user/{username}`: Change status, limits, or plan details.
  - `POST /api/user/{username}/reset`: Reset a user's consumed traffic.
- **User Deletion**: `DELETE /api/user/{username}`.

## 3. Node & Infrastructure
- **Node Monitoring (`GET /api/nodes`)**: Get status of all backend servers (Online/Offline, CPU, RAM, Version).
- **Node Management**:
  - `POST /api/node`: Add a new backend node.
  - `PUT /api/node/{node_id}`: Edit node configuration.
  - `DELETE /api/node/{node_id}`: Remove a node.
- **Node Usage**: `GET /api/nodes/usage`: View historical/current traffic per node.

## 4. Group & Access Control
- **Group Management**:
  - `GET /api/groups`: List all groups.
  - `POST /api/group`: Create a new group and link it to specific `inbound_tags` (e.g., specific servers or protocols).
  - `DELETE /api/group/{group_id}`: Delete a group.
- **Access Logic**: Map users to groups (`group_ids`) to control which nodes they can connect to.

## 5. Inbounds & Protocols
- **Inbound Listing (`GET /api/inbounds`)**: List all available entry points (VLESS, Reality, etc.) configured on the panel.
- **Dynamic Configuration**: View settings for each protocol (reality keys, ports, flows).

## 6. System & Diagnostics
- **System Stats (`GET /api/admin/system`)**: Get panel-wide metrics (Total Users, Online Users, Incoming/Outgoing Bandwidth, Server Specs).
- **Service Management**:
  - Restart services.
  - View panel logs.
  - Check core (Xray) version.

## 7. Subscription Services
- **Universal Subscription**: Every user has a unique subscription URL (`/sub/{token}`) that returns V2Ray/Clash/Sing-Box compatible configurations.
- **Template Management**: Customize the output of subscription links.

---
*Note: Most administrative actions require a Bearer Token in the Authorization header.*
