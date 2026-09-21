**FashionForge — Final Comprehensive Project Plan**

1\. Project Title

FashionForge — Interactive Digital Costume Design Studio

FashionForge is a web-based full-stack costume design application that allows users to create and customize their own costume digitally. Users can select different garment components such as top, bottom, sleeves, and collar/neckline, then choose the colour, fabric, and pattern. The selected components are combined and displayed immediately on a 2D virtual mannequin.

The system also provides a technical flat-sketch view, automatically generates basic garment specifications, gives rule-based style recommendations, calculates the estimated price, allows users to save designs, and supports a complete cart → checkout → simulated payment → order confirmation process.

The main purpose of FashionForge is to combine fashion customization, visual design, technical presentation, recommendation, and basic e-commerce functionality into one simple student-developed web application.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

2\. Main Objective

The main objective of FashionForge is:

To develop an interactive digital costume design studio where users can visually create, customize, preview, save, and purchase a simulated representation of their own costume design.

The project focuses mainly on the Design Studio, which is the central and most important part of the application.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

3\. Problem Statement

Traditional online clothing websites usually allow users to select from already-designed products. Some websites provide colour or print customization, but the user generally cannot freely combine different garment components and immediately see the complete costume.

Fashion students and beginners may also need separate tools for:

•	Creating a garment design

•	Viewing the front and back appearance

•	Preparing a technical flat sketch

•	Recording garment specifications

•	Getting basic style suggestions

•	Estimating price

FashionForge addresses this by bringing these functions into one simple web application.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

4\. Proposed Solution

FashionForge provides a component-based costume customization system.

The user can:

1\.	Open the website.

2\.	Enter the Design Studio.

3\.	Select a costume category/style.

4\.	Select garment components.

5\.	Choose colour.

6\.	Choose fabric.

7\.	Choose pattern.

8\.	See the changes immediately on a 2D mannequin.

9\.	Switch between front and back views.

10\.	View a technical flat sketch.

11\.	View automatically generated specifications.

12\.	Receive a rule-based style suggestion.

13\.	See the estimated price.

14\.	Save the design after logging in.

15\.	Add the design to the cart.

16\.	Proceed to checkout.

17\.	Select a simulated payment method.

18\.	Receive an order confirmation.

19\.	View basic order tracking/history.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

5\. Core Idea of the Project

The core of FashionForge is:

Component Selection → SVG Layering → Live Preview → Technical Sketch → Recommendation → Price Calculation → Save → Cart → Checkout

The application should not behave like a normal clothing store.

The Design Studio is the centrepiece.

The shopping functionality is secondary and exists to demonstrate how a completed design can proceed through a basic purchase workflow.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

6\. Target Users

FashionForge can be designed for:

•	Fashion design students

•	Beginners interested in costume design

•	Users who want to experiment with clothing combinations

•	Students preparing digital fashion concepts

•	Users who want to create a simple custom costume concept

The system is not intended to replace professional fashion CAD software.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

7\. Main Features

7.1 Home Page

The Home Page introduces FashionForge.

It should contain:

•	FashionForge logo/name

•	Short project description

•	Attractive fashion-themed design

•	Start Designing button

•	Design Now button

•	Login/Register options

•	Navigation menu

•	Brief explanation of the major features

Suggested navigation:

Home | Design Studio | My Designs | Cart | Profile | Login

The design should use a modern fashion-oriented interface with a white + pastel blue/purple theme, clean cards, rounded elements and simple animations.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

8\. Design Studio — Most Important Module

The Design Studio is the main module of FashionForge.

The page can be divided into three major areas:

Left side — Design Controls

Contains:

•	Costume/category selection

•	Top

•	Bottom

•	Sleeves

•	Collar/neckline

•	Colour

•	Fabric

•	Pattern

•	Style/occasion

Centre — Virtual Mannequin

Displays the selected costume.

The mannequin supports:

•	Front view

•	Back view

Changes should happen immediately without page reload.

Right side — Design Information

Displays:

•	Selected components

•	Garment specifications

•	Recommendation

•	Estimated price

•	Save Design

•	Add to Cart

This gives the user a complete design workspace.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

9\. Costume Components

The system will use a controlled set of reusable components.

Top

Examples:

•	Shirt

•	Kurti

•	Blouse

•	Dress top

Bottom

Examples:

•	Skirt

•	Pants

•	Palazzo

•	Straight bottom

Sleeves

Examples:

•	Sleeveless

•	Short sleeve

•	Long sleeve

•	Bell sleeve

Collar/Neckline

Examples:

•	Round neck

•	V-neck

•	Square neck

•	Collar neck

The exact number of components should remain manageable.

The project does not need hundreds of clothing combinations.

A collection of approximately 15–20 reusable SVG shapes is enough for the first version.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

10\. SVG-Based Visualization

FashionForge will use SVG for the costume visualization.

SVG means Scalable Vector Graphics.

Instead of creating a separate image for every possible costume combination, each garment component will be represented as a separate vector shape.

For example:

Top SVG

Bottom SVG

Sleeve SVG

Collar SVG

JavaScript combines these layers.

The approximate layer structure is:

Back View

&#x20;    ↓

Bottom

&#x20;    ↓

Top

&#x20;    ↓

Sleeves

&#x20;    ↓

Collar

&#x20;    ↓

Other details

The exact layer order will be adjusted so that the costume looks visually correct.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

11\. Why SVG is Used

SVG is suitable because:

•	It is lightweight.

•	It can be resized without losing quality.

•	Its colour can be changed using JavaScript/CSS.

•	Individual components can be controlled separately.

•	It supports layering.

•	It is easier to create a front/back technical representation.

•	It avoids creating a separate image for every combination.

Viva explanation

“Each costume component is stored as a separate SVG shape. JavaScript displays the selected shapes and applies the selected colour and pattern. Because the components are independent layers, the preview can be updated immediately when the user changes a selection.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

12\. Colour Selection

The application will provide:

•	Preset colour palette

•	Custom colour picker

When the user selects a colour, JavaScript updates the selected garment component immediately.

For example:

User selects Top

&#x20;       ↓

User selects Blue

&#x20;       ↓

JavaScript updates Top SVG

&#x20;       ↓

Mannequin immediately shows Blue Top

No Apply button or page reload is required.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

13\. Fabric Selection

The system will include a controlled set of fabrics:

•	Cotton

•	Silk

•	Linen

•	Denim

•	Velvet

•	Satin

The fabrics should have simple visual differences.

The project does not need realistic physical cloth simulation.

For example:

•	Cotton → simple matte appearance

•	Silk → slightly smooth appearance

•	Denim → denim-like texture

•	Velvet → darker/richer appearance

•	Satin → smoother/shinier appearance

The purpose is to communicate the selected fabric visually rather than simulate real-world fabric physics.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

14\. Pattern Selection

The application will provide:

•	Plain

•	Floral

•	Stripes

•	Checks

•	Traditional

Patterns can be represented using SVG patterns or CSS/SVG techniques.

For example:

Plain → solid fill



Stripes → repeated stripe pattern



Checks → repeated grid pattern



Floral → simple floral SVG pattern



Traditional → decorative repeating pattern

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

15\. Front and Back View

The mannequin will initially show the front view.

The user can select:

Front | Back

The system will then display the appropriate SVG components.

The front and back views do not need to be 3D.

This is a 2D layered visualization.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

16\. Technical Flat-Sketch View

One of the major differentiating features of FashionForge is the technical flat-sketch view.

The same selected costume components can be displayed as a fashion technical drawing.

Instead of a coloured mannequin presentation, the user can see an outline/technical representation.

For example:

DESIGN VIEW



&#x20;      👤

&#x20;  Coloured Costume





TECHNICAL VIEW



&#x20;      ┌─────┐

&#x20;      │     │

&#x20;      │     │

&#x20;      └─────┘

&#x20;    Technical

&#x20;     Outline

The exact visual style will be developed using SVG.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

17\. Garment Specifications

The system automatically displays basic specifications based on the user's selections.

Example:

Garment Type : Kurti

Neckline     : V-Neck

Sleeve       : Long Sleeve

Fabric       : Cotton

Colour       : Pastel Blue

Pattern      : Floral

View         : Front

This information changes automatically when the design changes.

The system does not need professional manufacturing specifications.

It provides a basic digital design specification suitable for the project's scope.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

18\. Rule-Based Style Recommendation

FashionForge will include a simple recommendation system.

It may be presented to the user as a style recommendation feature.

Technically, it will use JavaScript IF/THEN rules, not machine learning.

Example:

IF occasion = Wedding

AND preferred colour = Dark

THEN

fabric = Silk

pattern = Traditional

style = Elegant

Another example:

IF occasion = Casual

AND preferred colour = Light

THEN

fabric = Cotton

pattern = Plain

style = Simple

The system will display:

•	Recommended fabric

•	Recommended pattern

•	Recommended style/silhouette

•	Short reason

Example:

“Silk with a traditional pattern is suitable for a wedding occasion because it gives the design a formal appearance.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

19\. Why Rule-Based Recommendation?

A rule-based system is appropriate because:

•	It is simple.

•	It is easy to implement.

•	It is easy to test.

•	It is easy to explain during viva.

•	It does not require a machine-learning dataset.

•	It does not require expensive AI services.

•	It follows the project's free/open-source constraint.

The project should not claim to use machine learning.

If the project presentation calls it “AI-based recommendation,” it should be clearly explained that the implementation is a rule-based intelligent recommendation system.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

20\. Live Price Calculation

The price will be calculated dynamically.

Basic formula:

Total Price = Base Price + Fabric Surcharge + Pattern Surcharge + Extras

Example:

Base Price          ₹800

Fabric Surcharge    ₹200

Pattern Surcharge   ₹100

Extra                ₹50

\-------------------------

Total               ₹1150

Whenever the user changes:

•	Component

•	Fabric

•	Pattern

•	Extra

the displayed price updates immediately.

The price is an estimated project price, not a real market quotation.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

21\. Save Design

Users can save a completed design.

A saved design contains information such as:

User ID

Top

Bottom

Sleeves

Collar

Fabric

Colour

Pattern

Price

Created Date

The actual SVG image does not necessarily need to be stored.

Instead, the component selections can be stored.

When the design is opened again, the application reconstructs the preview from those selections.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

22\. My Designs

The My Designs page displays saved designs.

Each design can show:

•	Design preview

•	Design name/ID

•	Fabric

•	Colour

•	Pattern

•	Price

•	Date

Available actions:

•	View

•	Edit

•	Delete

•	Add to Cart

This allows users to return to previous designs.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

23\. User Authentication

FashionForge will provide:

Register

User enters:

•	Name

•	Email

•	Password

Login

User enters:

•	Email

•	Password

Passwords will be stored using bcrypt hashing rather than plain text.

The user can then access:

•	My Designs

•	Profile

•	Order history

•	Saved designs

Guest users should still be able to use the Design Studio.

Login should mainly be required when the user wants to save or purchase a design.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

24\. Profile

The Profile page can contain:

Name

Email

Saved Designs

Orders

Account information

Logout

The profile module should remain simple.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

25\. Cart

The user can add a completed design to the cart.

Cart information:

•	Design preview

•	Design name

•	Quantity

•	Price

•	Total

The user can:

•	Increase quantity

•	Decrease quantity

•	Remove item

•	Continue designing

•	Proceed to checkout

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

26\. Checkout

The checkout page collects basic information such as:

•	Customer name

•	Address

•	City

•	State

•	Pincode

•	Phone number

This is only for demonstrating the application workflow.

It does not connect to a real shipping service.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

27\. Payment Simulation

There will be no real payment gateway.

The user can select:

•	UPI

•	Card

•	Wallet

Then click:

Pay Now

The system will show a simulated success message.

Example:

Payment Successful



Payment Method: UPI

Amount: ₹1150



Transaction ID: SIM123456



Thank you!

The transaction is only simulated.

No actual money is transferred.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

28\. Order Confirmation

After simulated payment, the system creates an order confirmation.

It can display:

Order Confirmed



Order ID: FF20260001



Design: My Custom Kurti

Amount: ₹1150

Payment: Successful

Status: Order Placed

The user can then go to order history/tracking.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

29\. Order Tracking

Tracking will remain basic.

Example:

Order Placed

&#x20;    ↓

Design Confirmed

&#x20;    ↓

Processing

&#x20;    ↓

Completed

These are only simulated statuses.

There is no real courier integration.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

30\. Backend

The backend will use:

Node.js + Express.js

The backend will provide REST APIs for:

•	Registration

•	Login

•	User data

•	Saving designs

•	Retrieving designs

•	Updating designs

•	Deleting designs

•	Cart/order operations

•	Order history

Architecture:

USER

&#x20; ↓

HTML + CSS + JavaScript

&#x20; ↓

REST API

&#x20; ↓

Node.js + Express

&#x20; ↓

MongoDB

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

31\. Database

The database will use:

MongoDB Community Edition

The main collections will be:

Users

\_id

name

email

passwordHash

createdAt

Designs

\_id

userId

top

bottom

sleeves

collar

fabric

colour

pattern

price

createdAt

Components

\_id

category

name

svgRef

basePrice

Orders

\_id

userId

designId

amount

paymentStatus

orderStatus

createdAt

This structure is sufficient for the project's first version.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

32\. API Structure

Possible REST API structure:

POST   /api/auth/register

POST   /api/auth/login



GET    /api/designs

POST   /api/designs

GET    /api/designs/:id

PUT    /api/designs/:id

DELETE /api/designs/:id



POST   /api/orders

GET    /api/orders

GET    /api/orders/:id

The exact routes can be finalized during implementation.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

33\. Frontend Technology

The frontend will use:

•	HTML5

•	CSS3

•	Vanilla JavaScript

•	SVG

No React is required.

No Angular is required.

No Vue is required.

The reason is to keep the project:

•	Simple

•	Lightweight

•	Easy to understand

•	Easy to explain

•	Suitable for a final-year student project

Bootstrap can be used optionally if it makes responsive UI development easier.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

34\. Backend Technology

Use:

•	Node.js

•	Express.js

•	MongoDB

•	Mongoose

•	bcrypt

•	JSON/Web APIs

Only necessary packages should be installed.

Avoid adding unnecessary libraries.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

35\. Project Folder Structure

The final structure can be organized approximately as:

FashionForge/

│

├── frontend/

│   ├── index.html

│   ├── login.html

│   ├── register.html

│   ├── design.html

│   ├── my-designs.html

│   ├── cart.html

│   ├── checkout.html

│   ├── payment.html

│   ├── confirmation.html

│   ├── profile.html

│   ├── tracking.html

│   │

│   ├── css/

│   │   ├── style.css

│   │   └── responsive.css

│   │

│   ├── js/

│   │   ├── home.js

│   │   ├── auth.js

│   │   ├── design.js

│   │   ├── mannequin.js

│   │   ├── pricing.js

│   │   ├── recommendation.js

│   │   ├── cart.js

│   │   ├── payment.js

│   │   └── profile.js

│   │

│   └── assets/

│       ├── svg/

│       ├── patterns/

│       └── images/

│

├── backend/

│   ├── server.js

│   ├── package.json

│   │

│   ├── routes/

│   ├── models/

│   ├── controllers/

│   ├── middleware/

│   └── config/

│

└── README.md

The exact structure can be simplified during implementation if needed.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

36\. Important Design Principle

The project should use small JavaScript modules instead of putting everything into one extremely large file.

For example:

design.js

&#x20;   ↓

controls the Design Studio



mannequin.js

&#x20;   ↓

controls SVG preview



pricing.js

&#x20;   ↓

calculates price



recommendation.js

&#x20;   ↓

generates style recommendation

This makes the project easier to understand and debug.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

37\. User Flow

The final user flow should be:

&#x20;                   HOME

&#x20;                     ↓

&#x20;           ┌─────────┴─────────┐

&#x20;           ↓                   ↓

&#x20;       GUEST USER          LOGIN/REGISTER

&#x20;           ↓                   ↓

&#x20;           └─────────┬─────────┘

&#x20;                     ↓

&#x20;               DESIGN STUDIO

&#x20;                     ↓

&#x20;       Select Components

&#x20;                     ↓

&#x20;       Select Colour/Fabric

&#x20;                     ↓

&#x20;            Select Pattern

&#x20;                     ↓

&#x20;            Live Preview

&#x20;                     ↓

&#x20;            Front / Back

&#x20;                     ↓

&#x20;         Technical Sketch

&#x20;                     ↓

&#x20;       Garment Specifications

&#x20;                     ↓

&#x20;         Style Recommendation

&#x20;                     ↓

&#x20;           Price Calculation

&#x20;                     ↓

&#x20;               Save Design

&#x20;                     ↓

&#x20;              Add to Cart

&#x20;                     ↓

&#x20;                Checkout

&#x20;                     ↓

&#x20;           Payment Simulation

&#x20;                     ↓

&#x20;            Order Confirmation

&#x20;                     ↓

&#x20;             Order Tracking

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

38\. Guest User Flow

A major simplification is that users should not be forced to log in before designing.

A guest can:

•	Open Design Studio

•	Select components

•	Change colour

•	Change fabric

•	Change pattern

•	View mannequin

•	View technical sketch

•	View specifications

•	Get recommendation

•	See price

When they select:

Save Design or Add to Cart

the system can request login/register.

This makes the application easier and more user-friendly.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

39\. What Must Work Perfectly

The following features are the highest priority:

Priority 1 — Design Studio

Must work correctly.

Priority 2 — SVG Visualization

Must update correctly when selections change.

Priority 3 — Front/Back View

Must display the appropriate design.

Priority 4 — Technical Sketch

Must correspond to the selected costume.

Priority 5 — Specifications

Must update automatically.

Priority 6 — Price

Must calculate correctly.

These are the core features that should receive the most development and testing time.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

40\. Second-Level Features

These should work properly but are secondary:

•	Recommendation

•	Save Design

•	My Designs

•	Login/Register

•	Profile

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

41\. Supporting Features

These demonstrate the complete application flow:

•	Cart

•	Checkout

•	Payment simulation

•	Order confirmation

•	Tracking

They should be functional but should not take development time away from the Design Studio.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

42\. Testing Plan

Testing will include:

Functional Testing

Check whether each feature performs its expected function.

Examples:

•	Login works.

•	Registration works.

•	Component selection works.

•	Colour changes work.

•	Fabric changes work.

•	Pattern changes work.

•	Front/back switching works.

•	Price changes correctly.

•	Design saves correctly.

•	Cart works.

•	Payment simulation works.

UI Testing

Check:

•	Buttons

•	Forms

•	Navigation

•	Cards

•	Mannequin

•	Responsive layout

Database Testing

Check:

•	User data

•	Design data

•	Order data

Validation Testing

Check:

•	Empty fields

•	Invalid email

•	Incorrect password

•	Duplicate registration

•	Missing design components

Responsive Testing

Test on:

•	Desktop

•	Laptop

•	Tablet

•	Mobile

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

43\. Security

Basic security will be implemented.

Important points:

•	Passwords should be hashed using bcrypt.

•	Passwords should never be stored as plain text.

•	User input should be validated.

•	APIs should verify authenticated users where required.

•	Users should only access their own saved designs/orders.

•	Sensitive information should not be exposed to the frontend unnecessarily.

Because this is a student project, advanced enterprise security is outside the scope.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

44\. Free/Open-Source Principle

The project should primarily use free/open-source technologies.

Allowed

•	HTML

•	CSS

•	JavaScript

•	Node.js

•	Express

•	MongoDB Community Edition

•	SVG

•	Inkscape

•	GIMP

•	VS Code

•	Git

•	GitHub

•	Postman

•	Font Awesome Free

Avoid

•	Paid APIs

•	Paid AI APIs

•	Real payment gateways

•	Paid cloud services unless absolutely necessary

•	Commercial fashion APIs

•	Proprietary 3D engines

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

45\. Technologies Explicitly Not Required

To keep the project manageable, FashionForge will not require:

•	React

•	Angular

•	Vue

•	Three.js

•	WebGL

•	AR

•	Machine learning

•	Generative AI

•	Computer vision

•	Realistic cloth simulation

•	Real payment APIs

•	Real shipping APIs

•	Microservices

•	Complex cloud architecture

This is important because adding unnecessary technology can make the project harder to develop and explain.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

46\. Future Scope

The following features can be mentioned as future enhancements:

3D Mannequin

A future version could use Three.js for:

•	360° rotation

•	3D garments

•	Better visualization

AR Try-On

A future system could use:

•	Camera

•	Body detection

•	Augmented reality

Machine Learning

A future version could use a trained model to provide personalized recommendations.

Real Payment

A production system could integrate a payment gateway.

Real Inventory

The system could connect designs with:

•	Stock

•	Manufacturing

•	Delivery

Measurement-Based Fitting

Users could provide body measurements for customized fitting.

Social Sharing

Users could publish designs to a public gallery.

These are future scope only, not part of the current v1.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

47\. Clear Project Boundary

FashionForge IS:

An interactive 2D digital costume customization and design studio with basic recommendation, technical sketch, specification, pricing, saving and simulated purchasing functionality.

FashionForge IS NOT:

A 3D fashion simulator, AR fitting application, real online clothing marketplace, professional CAD system, machine-learning fashion designer, or real payment/shipping platform.

This distinction should be maintained throughout development and documentation.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

48\. Development Phases

Phase 1 — Project Setup

•	Create project folder

•	Set up frontend

•	Set up backend

•	Install Node.js dependencies

•	Set up MongoDB

•	Create Git repository

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 2 — Home Page

Build:

•	Header

•	Navigation

•	Hero section

•	Fashion-themed design

•	Start Designing button

•	Feature cards

•	Footer

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 3 — Design Studio UI

Build:

•	Component panel

•	Colour picker

•	Fabric selection

•	Pattern selection

•	Mannequin area

•	Front/back buttons

•	Price section

•	Specification section

At this stage, focus mainly on UI.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 4 — SVG System

Create:

•	Top SVGs

•	Bottom SVGs

•	Sleeve SVGs

•	Collar SVGs

•	Front view

•	Back view

•	Technical outline versions

Then connect them with JavaScript.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 5 — Live Customization

Implement:

Component selection

&#x20;      ↓

SVG update

&#x20;      ↓

Colour update

&#x20;      ↓

Fabric update

&#x20;      ↓

Pattern update

&#x20;      ↓

Live preview

This is a major milestone.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 6 — Technical Sketch

Implement:

•	Technical mode

•	Outline SVG

•	Front/back technical view

•	Automatic specifications

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 7 — Recommendation

Implement the rule table.

Example:

Occasion

&#x20;  +

Colour preference

&#x20;  +

Style preference

&#x20;  ↓

Recommendation

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 8 — Pricing

Implement the pricing formula.

Test every component and surcharge.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 9 — Backend

Create:

•	Express server

•	MongoDB connection

•	Models

•	Routes

•	Controllers

•	API endpoints

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 10 — Authentication

Implement:

•	Registration

•	Login

•	Password hashing

•	Session/token handling

•	Logout

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 11 — Save Designs

Connect Design Studio to the backend.

User:

Create design

&#x20;     ↓

Save

&#x20;     ↓

MongoDB

&#x20;     ↓

My Designs

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 12 — Cart and Orders

Implement:

•	Add to cart

•	Cart display

•	Checkout

•	Order creation

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 13 — Payment Simulation

Implement:

•	UPI

•	Card

•	Wallet

•	Pay Now

•	Success screen

No real payment processing.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 14 — Testing

Test every module individually and then test the complete user flow.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Phase 15 — Documentation

Prepare:

•	Abstract

•	Introduction

•	Existing system

•	Proposed system

•	Objectives

•	Requirements

•	System architecture

•	Modules

•	Database design

•	ER diagram

•	Use-case diagram

•	Flowchart

•	Implementation

•	Testing

•	Results

•	Future scope

•	Conclusion

•	References

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

49\. AI IDE Development Strategy

Because the project is large, it should not be given to an AI IDE as one huge instruction such as:

“Build the complete FashionForge project.”

Instead, development should happen in small stages.

For every AI-generated part, the process should be:

Give small requirement

&#x20;      ↓

AI generates code

&#x20;      ↓

Run the project

&#x20;      ↓

Test it

&#x20;      ↓

Understand the code

&#x20;      ↓

Fix errors

&#x20;      ↓

Move to next feature

This reduces errors and makes the final project easier to explain.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

50\. What You Should Understand for Viva

You do not need to memorize every line of code.

You should understand the purpose of each major part.

HTML

Defines the structure of the webpage.

CSS

Controls appearance, layout, colours and responsiveness.

JavaScript

Controls interaction and dynamic behaviour.

SVG

Represents the costume components as scalable vector shapes.

Node.js

Runs the backend JavaScript environment.

Express

Helps create the backend server and APIs.

MongoDB

Stores users, designs and orders.

REST API

Allows the frontend and backend to communicate.

bcrypt

Hashes user passwords before storing them.

Rule-Based Recommendation

Uses predefined IF/THEN rules to generate design suggestions.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

51\. Most Important Viva Explanation

If asked:

“How does FashionForge generate the costume?”

Answer:

“FashionForge stores the costume components as separate SVG shapes. The user selects the top, bottom, sleeves, collar, colour, fabric and pattern. JavaScript takes these selections and displays the corresponding SVG layers on the 2D mannequin. When the user changes a selection, only the required component is updated, so the preview changes immediately without reloading the page.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

52\. If Asked “Where is the AI?”

Answer:

“The current version uses a rule-based intelligent recommendation system rather than machine learning. It uses predefined IF/THEN rules based on occasion, colour preference and style to recommend suitable fabric, pattern and style. Machine-learning-based recommendation can be added as future scope.”

This is technically honest and easy to defend.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

53\. If Asked “Why Not 3D?”

Answer:

“The project focuses on an interactive 2D design studio and technical fashion presentation. A 3D mannequin would significantly increase development complexity, so 3D and AR have been kept as future enhancements.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

54\. If Asked “Why SVG?”

Answer:

“SVG allows each garment component to be stored and manipulated separately. It can be resized without losing quality and its colour and pattern can be changed dynamically using JavaScript. This makes SVG suitable for our component-based costume customization.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

55\. If Asked “Why MongoDB?”

Answer:

“MongoDB is suitable because the design data consists of flexible fields such as component selections, fabric, colour, pattern and price. It also works well with Node.js and is available as a free Community Edition.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

56\. If Asked “Why Node.js?”

Answer:

“Node.js allows us to use JavaScript on the backend, while Express provides a simple way to create REST APIs. It is lightweight and suitable for this web application.”

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

57\. If Asked “What Is the Main Innovation?”

A safe project-specific explanation is:

“The main contribution of FashionForge is the integration of component-level costume customization, live 2D visualization, front and back preview, technical flat-sketch output, automatic specifications, rule-based recommendations and price estimation in one student-developed web application.”

Do not claim that these ideas have never existed anywhere before.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

58\. Final Priority Order

If development time becomes limited, follow this order:

Must be completed

1\.	Design Studio

2\.	SVG components

3\.	Colour

4\.	Fabric

5\.	Pattern

6\.	Front/back view

7\.	Live preview

8\.	Technical sketch

9\.	Specifications

10\.	Price calculation

Next

11\.	Recommendation

12\.	Login/Register

13\.	Save Design

14\.	My Designs

Finally

15\.	Cart

16\.	Checkout

17\.	Payment simulation

18\.	Order confirmation

19\.	Tracking

This ensures that even if time becomes limited, the main project concept remains complete.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

59\. Final Frozen Scope

FashionForge v1 will contain:

Frontend

•	HTML5

•	CSS3

•	Vanilla JavaScript

•	SVG

Backend

•	Node.js

•	Express.js

Database

•	MongoDB Community Edition

Core Design

•	Top

•	Bottom

•	Sleeves

•	Collar/neckline

•	Colour

•	Fabric

•	Pattern

•	Front/back view

•	Live mannequin preview

•	Technical flat sketch

•	Garment specifications

•	Price estimation

Intelligent Feature

•	Rule-based style recommendation

User Features

•	Register

•	Login

•	Save design

•	My Designs

•	Profile

Purchase Simulation

•	Cart

•	Checkout

•	UPI/Card/Wallet selection

•	Simulated payment

•	Order confirmation

•	Basic tracking

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

60\. Final Out-of-Scope List

The following should not be added during v1 development:

❌ 3D mannequin

❌ 360° rotation

❌ AR try-on

❌ Machine-learning model

❌ Generative AI image generation

❌ Realistic fabric physics

❌ Real payment gateway

❌ Real shipping integration

❌ Real inventory management

❌ Admin dashboard

❌ Social media/public gallery

❌ Measurement-based fitting

❌ Complex body scanning

❌ Paid APIs

❌ Unnecessary frameworks or technologies

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

61\. Final One-Paragraph Project Definition

FashionForge — Interactive Digital Costume Design Studio is a full-stack web application developed using HTML5, CSS3, vanilla JavaScript, Node.js, Express.js and MongoDB. It allows users to digitally create a costume by combining garment components such as tops, bottoms, sleeves and collars, while selecting colours, fabrics and patterns. The selected components are rendered as layered SVG shapes on a 2D virtual mannequin with front and back views. The system also provides a technical flat-sketch representation, automatically generated garment specifications, rule-based style recommendations and live price estimation. Registered users can save and manage their designs, add designs to a cart, proceed through checkout and complete a simulated payment process followed by order confirmation and basic tracking. The project focuses on a simple, explainable and free/open-source implementation, while 3D visualization, AR, machine learning, real payment processing, inventory and advanced fitting are reserved for future development.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

Final Project Architecture

&#x20;                        FASHIONFORGE

&#x20;                             │

&#x20;                             ▼

&#x20;                        USER / GUEST

&#x20;                             │

&#x20;                             ▼

&#x20;                   ┌───────────────────┐

&#x20;                   │    FRONTEND       │

&#x20;                   │ HTML + CSS + JS   │

&#x20;                   └─────────┬─────────┘

&#x20;                             │

&#x20;            ┌────────────────┼────────────────┐

&#x20;            ▼                ▼                ▼

&#x20;      DESIGN STUDIO      USER ACCOUNT       CART

&#x20;            │                │                │

&#x20;            ▼                ▼                ▼

&#x20;      SVG MANNEQUIN       SAVE DESIGNS     CHECKOUT

&#x20;            │                │                │

&#x20;            ▼                ▼                ▼

&#x20;      FRONT / BACK       MY DESIGNS      PAYMENT SIM.

&#x20;            │

&#x20;            ▼

&#x20;      TECHNICAL SKETCH

&#x20;            │

&#x20;            ▼

&#x20;      SPECIFICATIONS

&#x20;            │

&#x20;            ▼

&#x20;      RECOMMENDATION

&#x20;            │

&#x20;            ▼

&#x20;      PRICE CALCULATION

&#x20;                             │

&#x20;                             ▼

&#x20;                      REST API / EXPRESS

&#x20;                             │

&#x20;                             ▼

&#x20;                          MONGODB

The final development philosophy

Keep the project simple, make the Design Studio excellent, make the core features work reliably, use technology that you can explain, and do not add advanced features merely to make the project look complicated.

This is now the master plan that the UI, database, backend, coding stages, documentation, PPT, diagrams, testing and viva preparation should all follow.





