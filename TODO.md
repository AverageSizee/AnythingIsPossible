# TODO: Update AdminDashboard.tsx to use Supabase CRUD

## Completed Tasks
- [x] Analyze current AdminDashboard.tsx using sessionStorage
- [x] Review Product interface with database fields
- [x] Review Supabase client setup
- [x] Review AddProduct.tsx for insert example
- [x] Get user approval for plan

## Pending Tasks
- [ ] Update imports to include supabase client
- [ ] Change formData state to use database field names (product_name, stock_quantit, Size, images array, etc.)
- [ ] Update useEffect to fetch products from Supabase instead of sessionStorage
- [ ] Update handleUpdate to perform update in Supabase
- [ ] Update handleDelete to perform delete in Supabase
- [ ] Update form fields to match database schema (remove category, color; change imageUrl to images array)
- [ ] Update product display to handle images array and Size string
- [ ] Remove all sessionStorage logic
- [ ] Test the updated dashboard functionality
