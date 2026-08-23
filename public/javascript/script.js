// WanderLust Frontend Scripts
(() => {
  "use strict";

  // 1. Bootstrap Form Validation
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // 2. Tax Switch Calculation Toggle (Index & Favourites)
  const taxSwitch = document.getElementById("flexSwitchCheckDefault");
  if (taxSwitch) {
    taxSwitch.addEventListener("change", function () {
      const isTaxIncluded = this.checked;
      const priceElements = document.querySelectorAll(".listing-price-value");
      const taxBadges = document.querySelectorAll(".tax-info");

      priceElements.forEach((el) => {
        const basePrice = Number(el.getAttribute("data-base-price")) || 0;
        if (isTaxIncluded) {
          const totalWithTax = Math.round(basePrice * 1.18);
          el.innerText = totalWithTax.toLocaleString("en-IN");
        } else {
          el.innerText = basePrice.toLocaleString("en-IN");
        }
      });

      taxBadges.forEach((badge) => {
        if (isTaxIncluded) {
          badge.classList.remove("d-none");
        } else {
          badge.classList.add("d-none");
        }
      });
    });
  }

  // 3. Image Upload Preview
  const imageInput = document.getElementById("image");
  const imagePreview = document.getElementById("imagePreview");
  if (imageInput && imagePreview) {
    imageInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.src = e.target.result;
          imagePreview.classList.remove("d-none");
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 4. Safe Password Toggle
  const togglePassword = document.querySelector("#togglePassword");
  const passwordField = document.querySelector("#password");
  if (togglePassword && passwordField) {
    togglePassword.addEventListener("click", function () {
      const isPassword = passwordField.getAttribute("type") === "password";
      passwordField.setAttribute("type", isPassword ? "text" : "password");
      this.classList.toggle("bi-eye");
      this.classList.toggle("bi-eye-slash");
    });
  }

  // 5. SweetAlert2 Delete Confirmations
  const deleteForms = document.querySelectorAll(".delete-form");
  deleteForms.forEach((form) => {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Are you sure?",
          text: "This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#fe424d",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
          customClass: {
            popup: "rounded-4",
            confirmButton: "btn btn-danger px-4",
            cancelButton: "btn btn-secondary px-4",
          },
        }).then((result) => {
          if (result.isConfirmed) {
            form.submit();
          }
        });
      } else {
        if (confirm("Are you sure you want to delete this item?")) {
          form.submit();
        }
      }
    });
  });

  // 6. Auto dismiss flash alerts after 5 seconds
  const flashAlerts = document.querySelectorAll(".auto-dismiss-alert");
  flashAlerts.forEach((alert) => {
    setTimeout(() => {
      const bsAlert = new bootstrap.Alert(alert);
      bsAlert.close();
    }, 5000);
  });
})(); 