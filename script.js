// ==========================
// TÌM KIẾM SẢN PHẨM
// ==========================

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");

if (searchInput && categoryFilter) {

    function filterProducts() {

        const keyword =
            searchInput.value.toLowerCase();

        const category =
            categoryFilter.value;

        const products =
            document.querySelectorAll(".product-card");

        products.forEach(product => {

            const name =
                product
                .querySelector("h3")
                .textContent
                .toLowerCase();

            const productCategory =
                product.dataset.category;

            const matchName =
                name.includes(keyword);

            const matchCategory =
                category === "all" ||
                productCategory === category;

            if (matchName && matchCategory) {

                product.style.display = "block";

            } else {

                product.style.display = "none";

            }

        });

    }

    searchInput.addEventListener(
        "input",
        filterProducts
    );

    categoryFilter.addEventListener(
        "change",
        filterProducts
    );
}


// ==========================
// ĐĂNG NHẬP
// ==========================

function login(event) {

    event.preventDefault();

    const email =
        document.getElementById("loginEmail").value;

    alert(
        "Đăng nhập thành công!\n\nEmail: " + email
    );

    window.location.href = "index.html";
}


// ==========================
// ĐĂNG KÝ
// ==========================

function register(event) {

    event.preventDefault();

    const password =
        document.getElementById("registerPassword").value;

    const confirm =
        document.getElementById("registerConfirm").value;

    if (password !== confirm) {

        alert(
            "Mật khẩu xác nhận không trùng khớp!"
        );

        return;
    }

    alert(
        "Đăng ký tài khoản thành công!"
    );

    window.location.href = "login.html";
}


// ==========================
// ĐĂNG SẢN PHẨM
// ==========================

function postProduct(event) {

    event.preventDefault();

    const name =
        document.getElementById("productName").value;

    alert(
        "Đăng sản phẩm thành công!\n\nSản phẩm: "
        + name
    );

    window.location.href = "products.html";
}


// ==========================
// LIÊN HỆ NGƯỜI BÁN
// ==========================

function contactSeller() {

    alert(
        "Tính năng nhắn tin sẽ được phát triển ở phần Backend."
    );

}