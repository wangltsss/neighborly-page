# **Neighborly: Technical Design Document**

**Date:** Jan 1, 2024 **Status:** Draft **Authors:** Jiahao Jiang

## **Summary**

**Neighborly** is a specialized community platform connecting residents of specific apartment buildings or communities. Neighborly provides a **dedicated digital space scoped to a physical building or neighborhood**. The Minimum Viable Product (MVP) delivers a verified, channel-based environment where residents can easily find their community and organize activities without the ambiguity of unverified external groups.

**Launch Strategy:** To bypass App Store friction and accelerate user feedback, the MVP will launch primarily as a **Responsive Web Application** (or an iOS Application ultimately).

## **Problem Statement**

Current digital solutions for residential communities suffer from significant structural limitations:

* **High Friction in Community Discovery:** Residents lack a central directory to find existing online communities for their building, often relying on inefficient word-of-mouth.  
* **Information Asymmetry:** Potential residents lack access to authentic information (e.g., noise levels, management quality) about apartments, while rental agencies hold all the leverage.  
* **Lack of Contextual Structure:** Generic group chats mix all topics (maintenance, social, sales) into a single stream, causing information overload and fragmentation.

## **User Stories**

**As a current resident, I want to:**

* Search for my building by address to find the correct community without needing an invite link.  
* Confirm building details (address, member count) before joining to ensure it is the correct location.  
* Access separated channels for different topics (e.g., `#marketplace`, `#social`, `#maintenance`) to keep discussions organized.  
* Send messages containing text and images to communicate effectively with neighbors.  
* Identify unread messages visually (e.g., via badges) to catch up on discussions I missed.

**As a potential resident, I want to:**

* Join the community to ask verified residents about their living experience before signing a lease.

## **Solution Overview**

The solution creates a digital twin for physical buildings. It consists of three tangible parts:

1. **The Web Client:** A responsive React Native Web application accessible via any browser. It serves as the primary interface for users to discover buildings and engage in chat.  
2. **The Building Data Partition:** A strict logical hierarchy within the shared database. Unlike open social networks, a **Building** acts as a data silo containing Metadata (Address), Channels (Topics), and Members. Users are strictly scoped: you cannot see content from Building B if you are only joined to Building A. *Note: This is implemented via database access patterns, not separate physical servers.*  
3. **The Real-Time Engine:** A persistent connection layer that delivers server-initiated events to connected clients. Instead of the browser asking if there are any new messages every few seconds, the backend pushes data to the client immediately via WebSockets.

## **System Architecture**

### **Frontend Client Architecture**

**Technology Stack:** React Native (Framework), TypeScript (Language), Expo (Build Tool), NativeWind (Styling). *Note: We leverage react-native-web to render the same components as HTML/CSS.*

#### **1\. Client State Ownership & Relationships**

To facilitate component interaction, we define strict ownership of global application state. All changes to this state must flow through the designated owner.

* **Global Client State (Single Source of Truth):**  
  * **Auth State:** Authentication token, User ID.  
  * **Active Building Context:** The ID of the building currently being viewed.  
  * **Channel Read State:** A mapping of `Channel ID` to `Last Read Timestamp`.

#### **2\. Component Dependencies**

* **Auth & Settings Component**  
  * **Owns:** Auth State.  
  * **Provides:** Authenticated User Context to all other components.  
  * **Action:** Initiates Login/Logout.  
* **Building Discovery Component**  
  * **Reads:** Auth State.  
  * **Writes:** Active Building Context (updates global state upon successfully joining a building).  
  * **Action:** Executes search queries against the directory.  
* **Building State & Unread Manager**  
  * **Reads:** Active Building Context.  
  * **Owns:** Channel Read State.  
  * **Emits:** Visual indicators (badges) for the Channel List UI.  
  * **Action:** Synchronizes local read timestamps with server events.  
* **Messaging & Media Component**  
  * **Reads:** Active Building Context, Channel Read State.  
  * **Writes:** Message Send Events.  
  * **Action:** Renders chat history and handles file uploads.

### **Backend Infrastructure (Functional Units)**

**Technology Stack:** Java 17 (Logic), AWS AppSync (API), Amazon DynamoDB (Data), Amazon S3 (Media Storage).

The backend is structured as a set of discrete serverless functions, orchestrated by the API Gateway.

#### **1\. Core Backend Functions**

* **Auth Resolver:**  
  * **Trigger:** Any API Request.  
  * **Responsibility:** Validates the authentication token signature and extracts the User Identity.  
* **Building Directory Resolver:**  
  * **Trigger:** Search Query / Join Mutation.  
  * **Responsibility:** Handles building lookups and updates the user profile with the new Building ID.  
* **Membership Validator:**  
  * **Trigger:** Message Send Mutation.  
  * **Responsibility:** A logic unit that verifies if the `Requesting User` is authorized to access the `Target Building`. This is the primary security gate.  
* **Message Write Handler:**  
  * **Trigger:** Validated Message Send.  
  * **Responsibility:** Persists the message payload to the database and formats the response object.  
* **Media Upload URL Generator:**  
  * **Trigger:** File Upload Request.  
  * **Responsibility:** Generates and returns a time-limited, pre-signed URL for secure object storage access.  
* **Read State Update Handler:**  
  * **Trigger:** Channel Exit / App Backgrounding.  
  * **Responsibility:** Persists the user's `Last Read Timestamp` to the database.

#### **2\. Invocation Model**

* Client requests are routed through **AppSync Resolvers**.  
* Each resolver invokes exactly **one** primary backend function (Lambda).  
* Backend functions do **not** call each other directly; they communicate via database state or return values to the API layer.

### **Data Access & Security Rules**

This section defines the logical boundaries for data isolation to ensure tenancy security.

* **Building Scope Enforcement:**  
  * **Rule 1:** Every data access request (Read or Write) MUST include a target `Building ID`.  
  * **Rule 2:** Before any operation, the **Membership Validator** checks that the User is a member of the target Building.  
  * **Rule 3:** Backend functions never execute "Cross-Building" queries (e.g., fetching messages from multiple buildings in one call).  
* **Security Boundary:**  
  * Clients cannot infer the existence of other buildings or channels they have not joined.  
  * All enforcement occurs server-side; the client is treated as untrusted.

### **Real-time Subscription Model**

This defines the lifecycle of the WebSocket connections used for instant messaging.

* **Subscription Scope:**  
  1. Subscriptions are established at the **Building \+ Channel** level.  
  2. Each subscription is identified by a unique pair: `(Building ID, Channel ID)`.  
* **Lifecycle:**  
  1. **On Entry:** When a user enters a building/channel, the client establishes a subscription for that specific context.  
  2. **On Switch:** When switching buildings, all existing subscriptions are terminated before new ones are created.  
  3. **On Reconnect:** If the network drops, the client automatically re-establishes subscriptions based on the current `Active Building Context`.  
* **Event Flow:**  
  1. **Message Write Handler** successfully persists a message.  
  2. **AppSync** detects the mutation success.  
  3. **AppSync** pushes the event payload **only** to clients currently subscribed to that specific `(Building ID, Channel ID)` pair.

## **Deployment & Hosting Strategy**

### **1\. Backend Hosting (Serverless)**

* **Compute:** **AWS Lambda**.  
* **API:** **AWS AppSync**.  
* **Data:** **Amazon DynamoDB** and **S3**.  
* **Deployment:** Infrastructure as Code (IaC) via **AWS CDK**.

### **2\. Frontend Hosting (Web First)**

* **Platform:** **Web**.  
* **Strategy:** Static Site Hosting on **Amazon S3** backed by **Amazon CloudFront** (CDN) for global low latency and SSL termination.  
* **Domain:** `app.neighborly.com`.

## **Technical Decision: AppSync vs. REST \+ Socket.io**

**Decision:** We chose **AWS AppSync**.

**Reasoning:** We chose AppSync specifically for its **managed WebSocket-based subscriptions** which are tightly integrated with authorization and the database layer. This significantly reduces the operational complexity compared to provisioning, scaling, and maintaining self-managed WebSocket servers (like Socket.io on EC2).

**Trade-off:** Vendor lock-in to the AWS ecosystem. We mitigate this by implementing core business logic in portable Java functions (Lambda), ensuring the "brain" of the application is not tied to the transport layer.

## **Security & Abuse Prevention (MVP)**

* **Authentication:** Strict enforcement of Cognito JWTs on all API endpoints.  
* **Rate Limiting:** AWS WAF (Web Application Firewall) deployed in front of AppSync to prevent API spamming.  
* **Data Isolation:** All database queries are strictly scoped by `BuildingID`.

## **Trade-offs & Known Limitations**

### **1\. Notification Delivery (No Web Push)**

* **Limitation:** As a Web-first MVP, we rely on the user having the browser tab open to receive real-time updates. When the tab is closed, the user is unreachable.  
* **Decision:** We have deferred **Web Push API** implementation to Phase 2\. Re-engagement currently relies on users voluntarily returning to the platform.

### **2\. Search Capabilities**

* **Limitation:** Search within a chat channel is limited to client-side filtering of loaded messages.  
* **Decision:** Implementing full-text server-side search (via Amazon OpenSearch) is too costly and complex for the MVP phase.

## **Out-of-Scope Goals**

### **Identity Verification System**

* **Objective:** Enforce "No Lease, No Talk".  
* **Status:** Deferred.  
* **Plan:** Manual review of S3 uploaded documents via an internal **Retool** dashboard.

### **Native iOS Application**

* **Status:** Deferred.  
* **Plan:** The codebase is React Native, allowing for a future iOS build via Expo EAS, but the MVP launch is strictly Web.

## **Project Management & Engineering Practices**

### **Version Control System (VCS)**

* **Platform:** **GitHub**.  
* **Workflow:** Feature Branch Workflow. Direct commits to `main` are blocked. All changes require a Pull Request (PR) with at least one review.  
* **Structure:** **Monorepo** containing `apps/client`, `backend`, and `infra`.

### **CI/CD Pipeline (GitHub Actions)**

1. **PR Check:** Runs Unit Tests (JUnit/Jest). Blocks merge on failure.  
2. **Deploy (Main):** Automatically deploys backend (CDK) and frontend (S3/CloudFront) upon merge.

### **Testing Strategy**

* **Unit Tests:** JUnit 5 (Backend logic) & Jest (Frontend components).  
* **System Integration Tests (E2E):** **Playwright**.  
  * Since local simulation of AppSync/IAM is unreliable, we rely on E2E tests running against a deployed `dev` environment to verify the full system integration (Auth \-\> API \-\> DB).

## **Technology Stack**

* **Frontend:** React Native Web, Expo, TypeScript.  
* **Backend:** Java 17, AWS Lambda, AWS AppSync.  
* **Data:** Amazon DynamoDB, Amazon S3.  
* **Infra:** AWS CDK.  
* **Ops:** Retool.

## **Success Criteria**

* **Functional:** Users can join a building, send a message, and see it appear on another device in \< 500ms.  
* **Performance:** Web app loads (FCP) in \< 1.5s.  
* **Stability:** Zero critical crashes on the main user flow.

