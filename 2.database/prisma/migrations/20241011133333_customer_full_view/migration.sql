-- This custom migration for customer full view.
drop view if exists "CustomerFullView";

create view "CustomerFullView" as
select
    c.*,
    cl.address_1,
    COALESCE(cl.address_2, ''),
    cl.city,
    cl.province,
    cl.country,
    cl.postal_code
from
    "Customer" c
    left join "CustomerLocation" cl on c.id = cl.customer_id
    and cl.is_primary = true;