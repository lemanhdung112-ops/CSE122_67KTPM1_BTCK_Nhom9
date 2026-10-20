(function () {
    window.ReUseHubRoleViews = window.ReUseHubRoleViews || {};
    window.ReUseHubRoleViews.owner = {
        renderItems(context, listings, requests) {
            const { store, node, actionButton, makeListingCard, makeRequestCard, empty, statBox } = context;
            const user = store.currentUser;
            const ownListings = listings.filter((entry) => entry.ownerId === user.id);
            const active = ownListings.filter((entry) => ["active", "repair", "reserved"].includes(entry.status)).length;
            const pending = requests.filter((entry) => entry.ownerId === user.id && entry.status === "pending").length;
            const stats = document.getElementById("owner-stats");
            stats.replaceChildren(
                statBox("Tin đang hoạt động", active),
                statBox("Chờ kiểm duyệt", ownListings.filter((entry) => entry.status === "pending").length),
                statBox("Yêu cầu chờ xử lý", pending),
                statBox("Đã hoàn tất", ownListings.filter((entry) => ["donated", "completed"].includes(entry.status)).length)
            );

            const listingHost = document.getElementById("owner-listings");
            listingHost.replaceChildren();
            if (!ownListings.length) listingHost.append(empty("Bạn chưa có món đồ nào. Hãy đăng món đầu tiên."));
            ownListings.forEach((listing) => {
                const actions = [];
                if (listing.status !== "archived" && listing.status !== "donated") {
                    actions.push(actionButton("Sửa", "edit-listing", listing.id));
                    actions.push(actionButton("Lưu trữ", "archive-listing", listing.id, "danger"));
                }
                const listingCard = makeListingCard(listing);
                const actionArea = node("div", "portal-card-actions");
                actionArea.append(...actions);
                listingCard.append(actionArea);
                listingHost.append(listingCard);
            });

            const requestHost = document.getElementById("owner-requests");
            requestHost.replaceChildren();
            const incoming = requests.filter((entry) =>
                entry.ownerId === user.id && entry.method !== "Cần sửa chữa"
            );
            if (!incoming.length) requestHost.append(empty("Chưa có yêu cầu nhận đồ gửi đến."));
            incoming.forEach((request) => requestHost.append(makeRequestCard(request, "owner")));
        }
    };
})();
