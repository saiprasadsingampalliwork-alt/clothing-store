# Earthen — how the website works

A walkthrough of every customer and staff function, from sign-in to sign-out. Use this to explain the finished site to a client. The same sections can become the slides.

Earthen is a clothing store. Prices are in rupees and include GST. Customers shop on the public site. Staff run the business from a separate studio at `/admin`. A customer account cannot open the studio, and a staff login cannot be used as a shopper account.

---

## 1. The two sides of the site

| Side | Who uses it | Where it starts |
| --- | --- | --- |
| Storefront | Shoppers | Home page, then Shop, product, bag, checkout, and account |
| Studio (admin) | Owner, catalog staff, order staff | `/admin/login` |

The storefront is open to everyone. Checkout does not require an account: the receipt goes to the email typed on the order, and that order can be opened again on the same browser. An account is what keeps past orders, saved addresses, the bag, and the wishlist when the person uses another device.

---

## 2. Customer storefront

### 2.1 What a visitor sees before signing in

**Home page**

- Season name, a headline, and a short paragraph, with two buttons: Shop the collection, and Our story.
- A rotating set of hero photographs. While a store-wide sale is live, the hero carries the sale name, the percent off, and a link into the shop.
- Three tiles for Women, Men, and Unisex, each with its own photograph and caption.
- A strip of categories, including New in.
- A season banner, with its own photograph and paragraph, and another link into new arrivals.
- New arrivals, with a link to shop the whole collection.
- A shelf of up to four pieces the visitor has already looked at. The same shelf appears on the account overview.
- Four promises: free shipping over a set amount, a return window, cash on delivery, and secure online payment.

A missing page shows a short note and two ways on: back home, or new arrivals.

The olive bar at the very top is an announcement. Staff write the message, or leave it blank so the site fills in the shipping threshold and the return window. The bar can link to a shop page or an external address, and it can be switched off.

**Header, on every shop page**

- Category links on a desktop. On a phone the menu also includes Our story, Account, and Help.
- Search.
- Account.
- Bag, with a live item count.
- The Earthen wordmark, which returns home.

**Footer**

- Shop links by category and by Women, Men, and Unisex.
- Help centre, shipping, returns, and contact.
- Our story, privacy, and terms.
- Studio name, address, GSTIN, phone, email, and hours.
- A mailing-list box: “Join the Earthen list”, with a note that the first order can use the code WELCOME10.

**Pages that need no account**

- Our story
- Help centre, with shipping, returns, payments, and common questions
- Shipping policy, returns policy, privacy, and terms
- Contact, with the studio address and a message form

### 2.2 Search and the shop

Search opens over the page. As the visitor types, matching pieces appear with their price, and a sale price is crossed out. They can open one piece or view all results. Popular searches are offered before they type: linen, overshirt, trousers, cardigan, and olive. Submitting the search opens a results page, sorted by popularity.

The shop lists the collection in a grid, 20 pieces to a page, with a count of how many are showing. The visitor can:

- Enter from a category, from New in, or from Women, Men, or Unisex.
- Sort by newest, popularity, price low to high, or price high to low.
- Filter by size, colour, gender, a price range, and “in stock”. Choosing Women also keeps unisex pieces, and choosing Men does the same. Unisex alone keeps only unisex. Search looks through the name, fabric, origin, description, category, audience, and colour. A near miss of one letter still matches. Popularity follows the number of reviews. Newest puts pieces marked new first.
- Clear filters and move between pages of results.

Each product card shows the piece, its audience, name, fabric, colours, and price. A sale price shows the earlier price crossed out. From the card, without opening the piece, the shopper can save it to the wishlist or add it to the bag. Adding opens a small picker for colour, size, and quantity. A size that is gone is struck through. If the piece has one colour, the heart saves it immediately. Tapping the heart again removes it.

### 2.3 A product page

On a piece, the shopper can:

- See photographs, name, price, fabric, and a star rating with the number of reviews. A new piece is marked New in. A sale shows the earlier price crossed out, and names the store-wide sale when that sale is what lowered the price.
- Read who the piece was photographed on: model height, the size they wear, and how it fits. Reviews add the reviewer’s height and size when those were given.
- Choose a colour and a size. The usual size saved on the account is pre-selected when one exists. A size that is gone is struck through. Changing colour or size resets the quantity to one.
- Change the quantity, limited to what is in stock. When three or fewer are left, the page says how many remain.
- Check whether a PIN code can be delivered to.
- Open a size guide in centimetres. Upper-body and lower-body charts follow the category.
- Read product details (including where the cloth is from), fabric and care, and shipping and returns.
- Add the piece to the bag. A bag panel opens on the right with the lines, a free-shipping bar, and two buttons: View bag, and Checkout.
- Save it to the wishlist, or remove it the same way.
- If that colour and size are gone, leave an email or a mobile number. An email address gets a note now, and another email when the piece is back, with a link to the product. A mobile number is kept on that browser only.
- Read reviews. A review can be written only by the signed-in customer who bought that piece, and only after it is delivered. It asks for 1 to 5 stars, a short note of 8 to 400 characters, a fit (runs small, true to size, or runs large), and an optional height. The same person can update their review. Until delivery, the page says the review can wait.
- See related pieces under “You may also like”.

Draft and archived products stay out of the shop. Only active products are for sale.

### 2.4 Bag

The bag lists each piece with colour, size, and price. The shopper can change quantity or remove a line.

A coupon can be typed, or picked from Offers for this order. Each offer shows the code, what it saves, and the minimum order. A code that does not fit this bag says why. An applied code can be removed. The same offers appear again at checkout.

The summary shows subtotal, shipping, discount, and total, all inclusive of GST. A bar shows how much more is needed for free standard delivery. Quantity cannot go above the units left in that colour and size.

An empty bag offers a way back into the shop.

### 2.5 Checkout

Checkout does not ask for an account. It is one page, in sections, with the order summary beside it (or tucked behind a tap on a phone).

1. **Contact.** Email for the receipt.
2. **Address.** Full name, mobile, address, area, city, state, and a 6-digit PIN. The state list is Karnataka, Tamil Nadu, Telangana, Maharashtra, Delhi, Kerala, Gujarat, and West Bengal. Saved addresses can be picked when the shopper is signed in, including the one marked default. The PIN is checked before payment. A code that starts with 0 or 9, or is not six digits, is refused.
3. **Order updates.** SMS or WhatsApp. The choice is stored on the order. The note on the page says the message is sent when the order ships and when it is out for delivery. The messages the system sends today are emails.
4. **Delivery.** Standard or express. Rates, the free-shipping threshold, and the day counts come from studio settings. A free-shipping coupon removes the charge on either speed.
5. **Gift, optional and closed until opened.** Gift wrap is included, with tissue, a recycled mailer, and a card. The card message can be up to 140 characters. Prices can be left off the packing slip. They stay on the invoice.
6. **Coupon.** The same code box and offer list as the bag.
7. **Payment.**
   - UPI (GPay, PhonePe, BHIM)
   - Card (Visa, Mastercard, RuPay)
   - Net banking
   - Cash on delivery, when the studio has it switched on and the order is within the COD limit. A COD fee is added and shown before the order is placed. Above the limit, or when COD is switched off, that choice is greyed out.

Online payments open Razorpay. The order is created after payment succeeds, and the bag is emptied. Cash on delivery places the order without a card charge. Payment is marked due until collection. Placing the order reduces stock for each colour and size. A blocked account cannot place an order.

After a successful order the shopper sees a thank-you page with the order number. A guest can open that order again on the same browser. Signing in later attaches the bag and wishlist to the account.

### 2.6 After the order

The order page shows:

- Order number, date, and current status.
- A progress line: Confirmed, Packed, Shipped, Out for delivery, Delivered.
- Courier tracking, once staff have added it.
- Gift-wrap and card notes, when the shopper asked for them.
- Line items, shipping, discount, COD fee, and total.
- Payment method, and whether delivery is standard or express, with the city and PIN.
- The return request, once one exists: refund or exchange, the reason, and whether it is waiting, approved, or rejected.
- A GST invoice, which can be printed or saved as a PDF. Each line shows the taxable amount, the tax, the amount, and the care notes for that piece.
- Cancel, while the order is still Confirmed or Packed. Cancelling puts the pieces back in stock. A paid Razorpay order is sent for refund. A coupon used on that order is given back one use.
- Return or exchange, once the order is Delivered and still inside the return window set in the studio.
- A link to review each piece after delivery.
- Continue shopping.

**Return or exchange**

The shopper chooses a reason (size or fit, changed my mind, damaged, not as described, or wrong item), writes a comment, and chooses refund or exchange. Pickup uses the delivery address. The request waits for staff. The customer is emailed when the request is received, approved, declined, or completed.

The window is the number of days in studio settings, counted from the delivery date. After it closes, the request is refused. Approving a refund marks the order Returned, puts the pieces back in stock, and sends a Razorpay refund when the order was paid online. Approving an exchange emails the customer and leaves the stock as it is, for staff to arrange the swap. Rejecting the request puts the order back to Delivered.

**Invoice**

The invoice is titled Tax invoice. It shows the studio’s legal name, address, phone, and GSTIN, who it is billed to, and the tax split. GST is already inside the shelf price: 5% on a piece up to ₹1,000, and 12% above that. Orders inside Karnataka show CGST and SGST. Orders to other states show IGST.

### 2.7 Account — sign in, use, sign out

**Create an account**

Name, email, 10-digit mobile, and a password of at least 8 characters. The new account opens straight into the account area.

**Sign in**

Email and password. A wrong password or a blocked account is refused. A blocked person is told to write to the studio. After a successful sign-in the shopper lands on the account overview, and the bag and wishlist on that browser are kept with the account.

**Forgot password**

The shopper enters their email and receives a reset link. The link expires after 30 minutes. They choose a new password and return to sign in.

**Account overview**

A greeting, then three counts: orders, wishlist items, and saved addresses. The latest order is linked. Pieces they asked to be told about when back in stock are listed. Recently viewed pieces appear below.

**Profile**

- Edit name and mobile. Email stays as the login and cannot be changed here.
- Set a usual size: XS, S, M, L, or XL. Product pages start on that size.
- Address book: add an address, mark one as the default, or remove one.

**Orders**

A list of this person’s orders: number, date, status, and total. Each row opens the order page described above. An empty list says there are no orders yet. Guest orders placed before sign-in appear here once the email on the order matches the account.

**Wishlist**

Saved colourways, with audience, name, colour, and price. From the list the shopper can pick a size and quantity and add the piece to the bag. A size that is gone is refused. Without an account the wishlist stays on that browser. After sign-in it stays with the account. The heart on a product or a card removes it.

**Sign out**

Sign out is in the account menu. It ends the customer session. The shop stays open for browsing.

---

## 3. Studio (admin dashboard)

Staff open `/admin/login` and sign in with a staff email and password. They land on the dashboard. The menu shows only the pages that role is allowed to open. Signing out is the initial in the corner.

### 3.1 Who can open what

| | Dashboard | Products | Categories | Orders | Returns | Customers | Coupons | Reports | Settings |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Owner | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| Catalog manager | Yes | Yes | | | | | Yes | | |
| Order and support | Yes | | | Yes | Yes | Yes | | Yes | |

The Owner invites the other two roles from Settings. An invited person signs in with the staff password issued at invite. Opening a page outside the role shows a short refusal instead of the page. On a phone the studio menu is a full-screen list.

### 3.2 Dashboard

Every role sees this page.

- Revenue today, compared with yesterday.
- Orders today, compared with yesterday.
- Pending shipments (Confirmed and Packed), and how many of those are from before today.
- Low-stock items: active pieces with 1 to 5 units left in a colour and size.
- A 7-day sales chart.
- The latest orders.
- Export of orders to a spreadsheet file.

Links onward to reports, inventory, and all orders appear only when that role can open those pages.

### 3.3 Products

- Search by name, SKU, category, or audience.
- Filter by status (active, draft, archived), category, gender, and in stock or out of stock.
- Add a product: name, category (or a new category name), gender, price, fabric, colour, and silhouette. A new piece is created in sizes XS to XL, with 12 units in each colour and size.
- Import a CSV. The header row can include name, slug, price, category, gender, fabric, color, hex, silhouette, status, and stock. A row whose name already exists updates that piece. Stock in the file is units per colour and size, from 1 to 99.
- Open a product to edit it. The list says how many of the catalog are showing.

**On a single product**

- Name, description, fabric, and care notes (one note per line).
- Price, and an optional sale price with start and end dates.
- Category, or a new category typed in place.
- Gender: Women, Men, or Unisex.
- Status: Active (on the shop), Draft (hidden), or Archived (hidden).
- Photographs, up to eight. The first photograph is the one on the shop card. They can be replaced and reordered.
- Colours, up to eight, each with a name and a colour chip. A colour can be added or removed. At least one colour stays.
- Stock for every colour and size. Raising a size that was at zero emails anyone who asked to be told, and includes a link back to the piece.
- Search title and search description. These are saved on the piece. Shop search itself matches the name, fabric, origin, description, category, audience, and colour names. The browser title of the product page stays the product name.
- Save. The shop uses the saved details.

Sizes stay XS to XL. The “new” mark, the cloth origin, the fit line, and the model note are part of the piece as it was created. They are not fields on this screen.

Each colour and size has an SKU, shown on orders and labels.

### 3.4 Categories

Owner only.

- Add or edit a category: name, a short line, a portrait photo, and whether the size chart is upper body or lower body.
- See how many pieces sit in each category.
- Remove a category.
- New in stays a shop filter for pieces marked new. It is not a category of its own.

The header, homepage, and shop read this list.

### 3.5 Orders

- Search by order number, customer name, email, or phone.
- Filter the list: All, Confirmed, Packed, Shipped, Delivered, or Cancelled. Each chip shows how many orders sit in it. Out for delivery, return requested, and returned are changed on the order itself.
- See how many of the full list are showing.
- Export the filtered list.

**On one order**

- Items, SKU, quantity, price, subtotal, shipping, GST included, and total.
- Status history, with the date of each step.
- Update status: Confirmed, Packed, Shipped, Out for delivery, Delivered, Cancelled, Return requested, Returned.
- Customer name, email, and mobile.
- Delivery address.
- Payment method, whether it is paid or still due (cash on delivery), and the Razorpay payment id when one exists.
- Internal note, visible to staff only.
- Create a shipment: courier name (Shiprocket is the starting value) and tracking number. Saving a shipment marks the order Shipped and gives the customer a tracking link. An order that is cancelled or already returned cannot be shipped.
- Print a shipping label: order number, name, address, mobile, courier, and tracking number.
- Print the GST invoice.

Moving an order to Cancelled while it is still Confirmed or Packed puts the pieces back in stock, gives the coupon use back, and sends a Razorpay refund when the order was paid online.

The customer receives an email when the status changes: confirmed, packed, shipped, out for delivery, delivered, cancelled, and the return emails listed below.

### 3.6 Returns and refunds

- Counts for requests waiting, rupees still to refund, return rate, and average time to decide.
- Filter: Requested, Approved, Rejected.
- Each row shows the order, item, reason, refund or exchange, and status.
- Approve or reject a waiting request. The customer is emailed the decision. An approved refund returns the stock and, for a Razorpay payment, sends the refund. An approved exchange is emailed and left for staff to fulfil. A rejection puts the order back to Delivered.
- Export the list.
- Open the related order.

### 3.7 Customers

- Search by name, email, or phone.
- See everyone, or only people with two or more orders.
- For each person: orders, amount spent, last order, and Active or Blocked.
- Open their order history.
- Block or unblock, from the person’s order history. A blocked person cannot sign in and cannot place another order. People who checked out as a guest are listed too, matched by the email on the order.
- Export the list.

### 3.8 Coupons

- Add a code.
- Three kinds of offer: a percent off, a fixed rupee amount off, or free shipping.
- Minimum order value.
- How many times the code may be used, and how many times it has been used.
- Optional start and end dates.
- Turn a code on or off.
- Search, and filter into Active, Scheduled, and Expired. Each row shows the offer, the minimum, how many uses are left, and the end date.
- Open a code to edit it.
- Remove a code. Cancelling an order that used the code gives one use back.

Customers enter the code in the bag or at checkout. A code applies when it is active, inside its dates, under its usage limit, and the bag meets the minimum.

A store-wide sale, set in Settings, is separate. It takes a percent off pieces that are not already on their own sale.

### 3.9 Reports

Three views, plus a “last 30 days” filter.

- **Sales.** Net sales, order count, average order, GST collected, refunds, sales by category, and sales by payment method.
- **GST.** Taxable value, CGST, SGST, and IGST, month by month. Karnataka orders split CGST and SGST. Other states use IGST.
- **Payments.** How much came through UPI, cards, cash on delivery, and net banking.

The page exports a GST spreadsheet. The buttons labelled CSV and Excel both download that spreadsheet.

### 3.10 Settings

Owner only. Nothing is published until Save changes is pressed.

- **Announcement bar.** Show or hide it, write the message (up to 140 characters), and optional link.
- **Store sale.** Name, percent off (1 to 90), start and end dates. The shop, bag, and checkout use this price on pieces that do not already have their own sale.
- **Shipping.** Free-shipping threshold, standard rate, express rate, and the standard delivery estimate.
- **Cash on delivery.** On or off, maximum order value, and the COD fee.
- **Returns.** Return window in days, which is what the shop enforces after delivery, and the refund method written here for staff. Allow exchanges is saved with the other settings. The return form on the shop still offers both refund and exchange.
- **Tax and invoices.** Business name, GSTIN, and whether prices include GST.
- **Studio address.** Legal name, address, phone, email, and hours. These appear in the footer, on the contact page, and on the invoice.
- **Homepage words.** Season name, headline, the paragraph beside the headline, and the paragraph beside the season picture.
- **Pictures.** Up to six homepage hero photographs, the sign-in photograph, the season banner, and the Women, Men, and Unisex tiles with their captions. JPEG, PNG, or WebP, under 6 MB.
- **Staff.** List of people and roles. The Owner can invite a person by name, email, and role.
- **Homepage banners.** Title, subtitle, and optional start and end dates. Each one is marked Live or Scheduled, and can be removed. The photographs and sentences shoppers see on the homepage come from Pictures and Homepage words.

### 3.11 Sign out

The staff initial, on desktop in the page header and on a phone in the top bar, signs that person out and returns them to the studio sign-in page.

---

## 4. What the customer is told, end to end

This is the story to walk a client through.

1. They arrive on the homepage, read the announcement, and browse by category or audience.
2. They search or filter, open a piece, check size and PIN, and add it to the bag.
3. They apply a coupon, see shipping, and check out.
4. They pay by UPI, card, or net banking, or choose cash on delivery when it is allowed.
5. They receive an order email and can follow Confirmed → Packed → Shipped → Out for delivery → Delivered.
6. They can cancel before the order ships, and they can ask for a return or exchange after it arrives.
7. They can download the invoice, review the piece, and sign out.

Staff, on the other side, see the order the moment it is placed, move it through packing and shipping, answer the return, and watch sales, stock, and tax from the studio.

---

## 5. Emails the site sends

When mail is configured, Earthen sends:

- Password reset (expires in 30 minutes).
- “We will email you when this is back”, and a second mail when that colour and size is restocked.
- Order confirmed, packed, shipped, out for delivery, delivered, and cancelled.
- Return requested, return approved, exchange approved, return declined, and returned.

---

## 6. Notes before the client meeting

Say these in the room so the demo matches the build.

- Customer sign-in is email and password. The create-account page says one-time-password sign-in is planned and is not part of this build.
- Order update preference at checkout is SMS or WhatsApp. The messages that go out today are emails.
- The contact form confirms on screen. It does not yet send that message to the studio inbox.
- The footer mailing list confirms on screen and points the person to the code WELCOME10. It does not yet store the address in a separate mailing tool.
- Online payment needs Razorpay keys. Without them, checkout says no payment is taken, and UPI, card, and net banking cannot take a live charge. Cash on delivery still places an order. A live Razorpay payment is refunded when that order is cancelled or a refund return is approved.
- The studio and the shop are separate logins. Walk them as two demos: one customer, then one owner.
- “Allow exchanges” in Settings is stored. It does not yet hide the exchange choice on the customer’s return form.
- The banner list in Settings is for staff. The live homepage is driven by Homepage words and Pictures.
