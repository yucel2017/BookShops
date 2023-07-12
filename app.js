let bookList = [];
let basketList = [];

toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  progressBar: false,
  positionClass: "toast-bottom-right",
  preventDuplicates: false,
  onclick: null,
  showDuration: "300",
  hideDuration: "1000",
  timeOut: "5000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
};

const toggleModal = () => {
  const basketModalEl = document.querySelector(".basket_modal");
  basketModalEl.classList.toggle("active");
};

const getBooks = () => {
  fetch("./products.json")
    .then((res) => res.json())
    .then((books) => (bookList = books));
};

getBooks();

const createBookStars = (starRate) => {
  let starRateHtml = "";
  for (let i = 1; i <= 5; i++) {
    if (Math.round(starRate) >= i)
      starRateHtml += `<i class="bi bi-star-fill active"></i>`;
    else starRateHtml += `<i class="bi bi-star-fill"></i>`;
  }

  return starRateHtml;
};

const createBookItemsHtml = () => {
  const bookListEl = document.querySelector(".book_list");
  let bookListHtml = "";
  bookList.forEach((book, index) => {
    bookListHtml += `
      <div class="col-5 ${index % 2 === 0 ? "offset-2" : ""} my-5">
        <div class="row book_card">
          <div class="col-6">
            <img class="img-fluid shadow" src="${
              book.imgSource
            }" width="258" height="400" />
          </div>
          <div class="col-6 d-flex flex-column justify-content-between">
            <div class="book_detail">
              <span class="fos gray fs-5">${book.author}</span><br />
              <span class="fs-4 fw-bold">${book.name}</span><br />
              <span class="book_star-rate">
                ${createBookStars(book.starRate)}
                <span class="gray">${book.reviewCount} reviews</span>
              </span>
            </div>
            <p class="book_description fos gray">
              ${book.description}
            </p>
            <div>
              <span class="black fw-bold fs-4 me-2">${book.price}₺</span>
              ${
                book.oldPrice
                  ? `<span class="fs-4 fw-bold old_price">${book.oldPrice}</span>`
                  : ""
              }
            </div>
            <button class="btn_purple" onclick="addBookToBasket(${
              book.id
            })">ADD BASKET</button>
          </div>
        </div>
      </div>`;
  });

  bookListEl.innerHTML = bookListHtml;
};

const BOOK_TYPES = {
  ALL: "Tümü",
  NOVEL: "Roman",
  CHILDREN: "Çocuk",
  SELFIMPROVEMENT: "Kişisel Gelişim",
  HISTORY: "Tarih",
  FINANCE: "Finans",
  SCIENCE: "Bilim",
};

const createBookTypesHtml = () => {
  const filterEl = document.querySelector(".filter");
  let filterHtml = "";
  let filterTypes = ["ALL"];
  bookList.forEach((book) => {
    if (filterTypes.findIndex((filter) => filter === book.type) === -1)
      filterTypes.push(book.type);
  });

  filterTypes.forEach((type, index) => {
    filterHtml += `
      <li class="${
        index === 0 ? "active" : ""
      }" onclick="filterBooks(this)" data-type="${type}">
        ${BOOK_TYPES[type] || type}
      </li>`;
  });

  filterEl.innerHTML = filterHtml;
};

const filterBooks = (filterEl) => {
  document.querySelector(".filter .active").classList.remove("active");
  filterEl.classList.add("active");
  let bookType = filterEl.dataset.type;
  getBooks();
  if (bookType !== "ALL")
    bookList = bookList.filter((book) => book.type === bookType);
  createBookItemsHtml();
};

const listBasketItems = () => {
  localStorage.setItem("basketList", JSON.stringify(basketList));
  const basketListEl = document.querySelector(".basket_list");
  const basketCountEl = document.querySelector(".basket_count");
  basketCountEl.innerHTML = basketList.length > 0 ? basketList.length : null;
  const totalPriceEl = document.querySelector(".total_price");

  let basketListHtml = "";
  let totalPrice = 0;
  basketList.forEach((item) => {
    totalPrice += item.product.price * item.quantity;
    basketListHtml += `
      <li class="basket_item">
        <img src="${item.product.imgSource}" width="100" height="100" />
        <div class="basket_item-info">
          <h3 class="book_name">${item.product.name}</h3>
          <span class="book_price">${item.product.price}₺</span><br />
          <span class="book_remove" onclick="removeItemToBasket(${item.product.id})">remove</span>
        </div>
        <div class="book_count">
          <span class="decrease" onclick="decreaseItemToBasket(${item.product.id})">-</span>
          <span class="my-5">${item.quantity}</span>
          <span class="increase" onclick="increaseItemToBasket(${item.product.id})">+</span>
        </div>
      </li>`;
  });

  basketListEl.innerHTML = basketListHtml
    ? basketListHtml
    : `<li class="basket_item">No items to Buy again.</li>`;
  totalPriceEl.innerHTML =
    totalPrice > 0 ? "Total : " + totalPrice.toFixed(2) + "₺" : null;
};

const addBookToBasket = (bookId) => {
  let foundBook = bookList.find((book) => book.id === bookId);
  if (foundBook) {
    const basketAlreadyIndex = basketList.findIndex(
      (basket) => basket.product.id === bookId
    );
    if (basketAlreadyIndex === -1) {
      let addedItem = { quantity: 1, product: foundBook };
      basketList.push(addedItem);
    } else {
      if (
        basketList[basketAlreadyIndex].quantity <
        basketList[basketAlreadyIndex].product.stock
      )
        basketList[basketAlreadyIndex].quantity += 1;
      else {
        toastr.error("Sorry, we don't have enough stock.");
        return;
      }
    }
    listBasketItems();
    toastr.success("Book added to basket successfully.");
  }
};

const removeItemToBasket = (bookId) => {
  const foundIndex = basketList.findIndex(
    (basket) => basket.product.id === bookId
  );
  if (foundIndex !== -1) {
    basketList.splice(foundIndex, 1);
  }
  listBasketItems();
};

const decreaseItemToBasket = (bookId) => {
  const foundIndex = basketList.findIndex(
    (basket) => basket.product.id === bookId
  );
  if (foundIndex !== -1) {
    if (basketList[foundIndex].quantity !== 1)
      basketList[foundIndex].quantity -= 1;
    else removeItemToBasket(bookId);
    listBasketItems();
  }
};

const increaseItemToBasket = (bookId) => {
  const foundIndex = basketList.findIndex(
    (basket) => basket.product.id === bookId
  );
  if (foundIndex !== -1) {
    if (basketList[foundIndex].quantity < basketList[foundIndex].product.stock)
      basketList[foundIndex].quantity += 1;
    else toastr.error("Sorry, we don't have enough stock.");
    listBasketItems();
  }
};

if (localStorage.getItem("basketList")) {
  basketList = JSON.parse(localStorage.getItem("basketList"));
  listBasketItems();
}

setTimeout(() => {
  createBookItemsHtml();
  createBookTypesHtml();
}, 100);
