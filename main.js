$(document).ready(function () {
    // ========== THEME MANAGEMENT with SAVE/LOAD ==========
    let savedTheme = localStorage.getItem("hospitalTheme");
    if (savedTheme === "dark") {
        $("#theme-style").attr("href", "css/style-dark.css");
    } else {
        $("#theme-style").attr("href", "css/style-light.css");
    }
    
    $("#toggle-theme").click(function () {
        let currentTheme = $("#theme-style").attr("href");
        if (currentTheme.includes("light")) {
            $("#theme-style").attr("href", "css/style-dark.css");
            localStorage.setItem("hospitalTheme", "dark");
        } else {
            $("#theme-style").attr("href", "css/style-light.css");
            localStorage.setItem("hospitalTheme", "light");
        }
    });

    // ========== DOCTORS DATA ==========
    const doctors = [
        { name: "Dr. Ahmed Ali", specialty: "Cardiology", rating: 4.8, price: 300, experience: "12 years", image: "doctor1.jpg" },
        { name: "Dr. Sara Mahmoud", specialty: "Orthopedics", rating: 4.5, price: 250, experience: "8 years", image: "doctor2.jpg" },
        { name: "Dr. Khaled Hassan", specialty: "Pediatrics", rating: 4.9, price: 200, experience: "15 years", image: "doctor3.jpg" },
        { name: "Dr. Noha Adel", specialty: "Neurology", rating: 4.7, price: 350, experience: "10 years", image: "doctor4.jpg" }
    ];

    // ========== COMPARE LIST - LOCALSTORAGE ==========
    function getCompareList() {
        let list = localStorage.getItem("compareDoctors");
        return list ? JSON.parse(list) : [];
    }

    function saveCompareList(list) {
        localStorage.setItem("compareDoctors", JSON.stringify(list));
    }

    // ========== RENDER DOCTORS ==========
    function renderDoctors(page = 1) {
        if (!$("#results").length) return;
        
        let search = $("#search-doctor").val().toLowerCase();
        let filtered = doctors.filter(d => d.name.toLowerCase().includes(search) || d.specialty.toLowerCase().includes(search));
        let perPage = 2;
        let start = (page - 1) * perPage;
        let paginated = filtered.slice(start, start + perPage);
        let html = "";
        
        paginated.forEach(d => {
            html += `<div class='doctor-card'>
                <img src='images/${d.image}' width='100' style='border-radius:50%'>
                <h3>${d.name}</h3>
                <p>Specialty: ${d.specialty}</p>
                <p>Rating: ${d.rating} ⭐</p>
                <p>Price: $${d.price}</p>
                <p>Experience: ${d.experience}</p>
                <button class='compare-btn' data-name='${d.name}' data-specialty='${d.specialty}' data-rating='${d.rating}' data-price='${d.price}' data-experience='${d.experience}'>➕ Compare</button>
            </div>`;
        });
        
        $("#results").html(html);
        
        let totalPages = Math.ceil(filtered.length / perPage);
        let pagesHtml = "";
        for (let i = 1; i <= totalPages; i++) {
            pagesHtml += `<button class='page-btn' data-page='${i}'>${i}</button>`;
        }
        $("#pagination").html(pagesHtml);
    }

    // ========== ADD TO COMPARE ==========
    $(document).on("click", ".compare-btn", function () {
        let doctor = {
            name: $(this).data("name"),
            specialty: $(this).data("specialty"),
            rating: $(this).data("rating"),
            price: $(this).data("price"),
            experience: $(this).data("experience")
        };
        
        let compareList = getCompareList();
        
        if (compareList.length < 2 && !compareList.some(d => d.name === doctor.name)) {
            compareList.push(doctor);
            saveCompareList(compareList);
            alert(`${doctor.name} added to comparison! Go to Compare page to see.`);
        } else if (compareList.length >= 2) {
            alert("You can compare only 2 doctors. Clear comparison first.");
        } else {
            alert("This doctor is already in comparison list.");
        }
        
        updateCompareTable();
    });

    // ========== UPDATE COMPARE TABLE ==========
    function updateCompareTable() {
        if (!$("#compare-body").length) return;
        
        let compareList = getCompareList();
        
        if (compareList.length === 0) {
            $("#compare-body").html("<tr><td colspan='5'>⚠️ No doctors selected for comparison. Go to Doctors page and click Compare button.</td></tr>");
        } else {
            let html = "";
            compareList.forEach(d => {
                html += `<tr>
                    <td><strong>${d.name}</strong></td>
                    <td>${d.specialty}</td>
                    <td>${d.rating} ⭐</td>
                    <td>$${d.price}</td>
                    <td>${d.experience}</td>
                </tr>`;
            });
            $("#compare-body").html(html);
        }
    }

    // ========== CLEAR COMPARE ==========
    $("#clear-compare").click(function () {
        saveCompareList([]);
        updateCompareTable();
        alert("Comparison list cleared!");
    });

    // ========== APPOINTMENT FORM - CUSTOM VALIDATION ==========
    $("#book-form").submit(function (e) {
        e.preventDefault();
        
        let name = $("#patient-name").val().trim();
        let phone = $("#patient-phone").val().trim();
        let email = $("#patient-email").val().trim();
        let date = $("#appointment-date").val();
        let time = $("#appointment-time").val();
        let doctor = $("#doctor-select").val();
        
        let errors = [];
        
        if (name === "") errors.push("Full name is required");
        if (phone === "") errors.push("Phone number is required");
        else if (!/^\d{10,12}$/.test(phone.replace(/[^0-9]/g, ''))) errors.push("Phone number must be 10-12 digits");
        if (email === "") errors.push("Email is required");
        else if (!email.includes("@") || !email.includes(".")) errors.push("Valid email is required");
        if (date === "") errors.push("Appointment date is required");
        if (time === "") errors.push("Preferred time is required");
        if (doctor === "") errors.push("Please select a doctor");
        
        if (errors.length > 0) {
            $("#form-message").html("<span style='color:red'>⚠️ " + errors.join(" • ") + "</span>");
        } else {
            $("#form-message").html("<span style='color:green'>✓ Appointment booked successfully! We will contact you soon.</span>");
            this.reset();
            localStorage.setItem("lastAppointment", JSON.stringify({name, phone, email, date, time, doctor}));
        }
    });

    // ========== FEEDBACK FORM - CUSTOM VALIDATION ==========
    $("#feedback-form").submit(function (e) {
        e.preventDefault();
        
        let name = $("#feedback-name").val().trim();
        let email = $("#feedback-email").val().trim();
        let type = $("#feedback-type").val();
        let msg = $("#feedback-msg").val().trim();
        let rating = $("#feedback-rating").val();
        
        let errors = [];
        
        if (name === "") errors.push("Name is required");
        if (email === "") errors.push("Email is required");
        else if (!email.includes("@") || !email.includes(".")) errors.push("Valid email is required");
        if (type === "") errors.push("Please select feedback type");
        if (msg === "") errors.push("Message cannot be empty");
        if (rating === "0") errors.push("Please rate your experience");
        
        if (errors.length > 0) {
            $("#feedback-message").html("<span style='color:red'>⚠️ " + errors.join(" • ") + "</span>");
        } else {
            $("#feedback-message").html("<span style='color:green'>Thank you for your feedback! ❤️</span>");
            this.reset();
            $(".star").removeClass("active");
            $("#feedback-rating").val("0");
            
            let allFeedbacks = JSON.parse(localStorage.getItem("feedbacks") || "[]");
            allFeedbacks.push({name, email, type, msg, rating, date: new Date().toISOString()});
            localStorage.setItem("feedbacks", JSON.stringify(allFeedbacks));
        }
    });

    // ========== RATING STARS ==========
    $(".star").click(function () {
        let rating = $(this).data("rating");
        $("#feedback-rating").val(rating);
        $(".star").removeClass("active");
        for (let i = 1; i <= rating; i++) {
            $(`.star[data-rating='${i}']`).addClass("active");
        }
    });

    // ========== LOGIN FORM - CUSTOM VALIDATION ==========
    $("#login-form").submit(function (e) {
        e.preventDefault();
        
        let email = $("#login-email").val().trim();
        let password = $("#login-password").val();
        
        let errors = [];
        
        if (email === "") errors.push("Email is required");
        else if (!email.includes("@") || !email.includes(".")) errors.push("Valid email is required");
        if (password === "") errors.push("Password is required");
        else if (password.length < 4) errors.push("Password must be at least 4 characters");
        
        if (errors.length > 0) {
            $("#login-message").html("<span style='color:red'>⚠️ " + errors.join(" • ") + "</span>");
        } else {
            let users = JSON.parse(localStorage.getItem("users") || "[]");
            let user = users.find(u => u.email === email && u.password === password);
            if (user) {
                $("#login-message").html("<span style='color:green'>✓ Login successful! Welcome back " + user.name + ".</span>");
                localStorage.setItem("loggedInUser", JSON.stringify(user));
            } else {
                $("#login-message").html("<span style='color:red'>✖️ Invalid email or password. Please register first.</span>");
            }
        }
    });

    // ========== REGISTER FORM - CUSTOM VALIDATION ==========
    $("#register-form").submit(function (e) {
        e.preventDefault();
        
        let name = $("#reg-name").val().trim();
        let email = $("#reg-email").val().trim();
        let phone = $("#reg-phone").val().trim();
        let password = $("#reg-password").val();
        let confirm = $("#reg-confirm").val();
        
        let errors = [];
        
        if (name === "") errors.push("Full name is required");
        if (email === "") errors.push("Email is required");
        else if (!email.includes("@") || !email.includes(".")) errors.push("Valid email is required");
        if (phone === "") errors.push("Phone number is required");
        else if (!/^\d{10,12}$/.test(phone.replace(/[^0-9]/g, ''))) errors.push("Phone must be 10-12 digits");
        if (password === "") errors.push("Password is required");
        else if (password.length < 6) errors.push("Password must be at least 6 characters");
        if (password !== confirm) errors.push("Passwords do not match");
        
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        if (users.some(u => u.email === email)) {
            errors.push("Email already registered. Please login.");
        }
        
        if (errors.length > 0) {
            $("#register-message").html("<span style='color:red'>⚠️ " + errors.join(" • ") + "</span>");
        } else {
            let newUser = {name, email, phone, password, registerDate: new Date().toISOString()};
            users.push(newUser);
            localStorage.setItem("users", JSON.stringify(users));
            $("#register-message").html("<span style='color:green'>✓ Account created successfully! You can now login.</span>");
            this.reset();
        }
    });

    // ========== CONTACT FORM ==========
    $("#contact-form").submit(function (e) {
        e.preventDefault();
        
        let name = $("#contact-name").val().trim();
        let email = $("#contact-email").val().trim();
        let subject = $("#contact-subject").val().trim();
        let msg = $("#contact-msg").val().trim();
        
        let errors = [];
        
        if (name === "") errors.push("Name is required");
        if (email === "") errors.push("Email is required");
        else if (!email.includes("@") || !email.includes(".")) errors.push("Valid email is required");
        if (subject === "") errors.push("Subject is required");
        if (msg === "") errors.push("Message is required");
        
        if (errors.length > 0) {
            $("#contact-message").html("<span style='color:red'>⚠️ " + errors.join(" • ") + "</span>");
        } else {
            $("#contact-message").html("<span style='color:green'>✓ Message sent successfully! We will reply within 24 hours.</span>");
            this.reset();
            
            let messages = JSON.parse(localStorage.getItem("contactMessages") || "[]");
            messages.push({name, email, subject, msg, date: new Date().toISOString()});
            localStorage.setItem("contactMessages", JSON.stringify(messages));
        }
    });

    // ========== PAGINATION & VIEWS ==========
    $(document).on("click", ".page-btn", function () {
        renderDoctors($(this).data("page"));
    });

    $("#search-doctor").on("input", function () {
        renderDoctors(1);
    });
    
    $("#list-view").click(function () {
        $("#results").removeClass("grid-view").addClass("list-view");
    });
    
    $("#grid-view").click(function () {
        $("#results").removeClass("list-view").addClass("grid-view");
    });

    // ========== INITIALIZE ==========
    if ($("#results").length) {
        renderDoctors(1);
    }
    
    if ($("#compare-body").length) {
        updateCompareTable();
    }
});