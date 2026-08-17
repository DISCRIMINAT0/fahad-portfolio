/* ==========================================================================
   Muhammad Fahad Bhutta — Portfolio Interactions
   Vanilla JavaScript, modular functions, no dependencies.
   ========================================================================== */
(function () {
    "use strict";

    const $ = (sel, ctx) => (ctx || document).querySelector(sel);
    const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ------------------------------------------------------------------
       Navbar state on scroll + back-to-top visibility
       ------------------------------------------------------------------ */
    function initScrollState() {
        const navbar = $("#navbar");
        const backToTop = $("#backToTop");
        if (!navbar || !backToTop) return;

        let ticking = false;
        function onScroll() {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(() => {
                const y = window.scrollY;
                navbar.classList.toggle("is-scrolled", y > 20);
                backToTop.classList.toggle("is-visible", y > 480);
                ticking = false;
            });
        }

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
        });

        // Footer "Back to top" button
        const footerTop = $("#footerTop");
        if (footerTop) {
            footerTop.addEventListener("click", () => {
                window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
            });
        }
    }

    /* ------------------------------------------------------------------
       Mobile navigation toggle
       ------------------------------------------------------------------ */
    function initMobileNav() {
        const toggle = $("#navToggle");
        const menu = $("#navMenu");
        if (!toggle || !menu) return;

        function setOpen(open) {
            toggle.setAttribute("aria-expanded", String(open));
            menu.classList.toggle("is-open", open);
            toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
        }

        toggle.addEventListener("click", () => {
            setOpen(toggle.getAttribute("aria-expanded") !== "true");
        });

        // Close when a link is chosen
        $$(".nav-link", menu).forEach((link) => {
            link.addEventListener("click", () => setOpen(false));
        });

        // Close with Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && menu.classList.contains("is-open")) {
                setOpen(false);
                toggle.focus();
            }
        });

        // Close when clicking outside
        document.addEventListener("click", (e) => {
            if (!menu.classList.contains("is-open")) return;
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                setOpen(false);
            }
        });
    }

    /* ------------------------------------------------------------------
       Scroll reveal via IntersectionObserver
       ------------------------------------------------------------------ */
    function initReveal() {
        const items = $$(".reveal");
        if (!("IntersectionObserver" in window) || prefersReducedMotion) {
            items.forEach((el) => el.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );

        items.forEach((el) => observer.observe(el));
    }

    /* ------------------------------------------------------------------
       Active navigation state based on the section in view
       ------------------------------------------------------------------ */
    function initActiveNav() {
        const links = $$(".nav-link");
        const sections = links
            .map((link) => document.querySelector(link.getAttribute("href")))
            .filter(Boolean);

        if (!("IntersectionObserver" in window) || sections.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    links.forEach((link) => {
                        const target = entry.target.id;
                        link.classList.toggle("active", link.getAttribute("href") === "#" + target);
                    });
                });
            },
            { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
        );

        sections.forEach((sec) => observer.observe(sec));
    }

    /* ------------------------------------------------------------------
       Skill filtering
       ------------------------------------------------------------------ */
    function initSkillFilter() {
        const buttons = $$(".filter-btn");
        const cards = $$(".skill-card");
        if (!buttons.length || !cards.length) return;

        buttons.forEach((btn) => {
            btn.addEventListener("click", () => {
                buttons.forEach((b) => b.classList.remove("is-active"));
                btn.classList.add("is-active");

                const filter = btn.dataset.filter;
                cards.forEach((card) => {
                    const show = filter === "all" || card.dataset.category === filter;
                    card.classList.toggle("is-hidden", !show);
                });
            });
        });
    }

    /* ------------------------------------------------------------------
       Project modal (data-driven, accessible)
       ------------------------------------------------------------------ */
    const PROJECT_DATA = {
        hospital: {
            title: "Online Hospital Management System",
            subtitle: "Final-year web-based Hospital Management System",
            tech: ["ASP.NET", "C#", "SQL Server", "HTML", "CSS", "JavaScript"],
            features: [
                "Patient registration", "Doctor management", "Appointment scheduling",
                "Billing", "Medical records management", "Secure login",
                "Role-based access for administrators, doctors and patients",
                "SQL Server database", "CRUD operations", "Responsive user interface"
            ],
            focus: "A full-stack, role-based system covering the complete patient care workflow, from registration and scheduling to billing and medical record management — with secure authentication and a responsive interface."
        },
        employee: {
            title: "Employee Management System",
            subtitle: "Web-based employee & organizational data management",
            tech: ["ASP.NET", "C#", "SQL Server"],
            features: ["Employee record management", "CRUD operations", "Database integration"],
            focus: "A focused CRUD application that demonstrates clean data modeling and reliable database integration for managing organizational records."
        },
        student: {
            title: "Student Management System",
            subtitle: "Database-driven student information management",
            tech: ["C#", "ASP.NET", "SQL Server"],
            features: [
                "Store, manage and retrieve student information",
                "Database-driven architecture", "CRUD operations"
            ],
            focus: "A database-driven application built to store, manage and retrieve student records efficiently, highlighting relational database design."
        },
        library: {
            title: "Library Management System",
            subtitle: "Book records, borrowing & return tracking",
            tech: ["Web Application", "Database Management"],
            features: ["Book record management", "Borrowing details", "Return tracking"],
            focus: "A system for managing book records and tracking borrow and return activity, keeping library operations organized and auditable."
        },
        login: {
            title: "Login Authentication System",
            subtitle: "Username & password validation",
            tech: ["Authentication", "Web Development"],
            features: ["Username and password validation", "Secure session-based login"],
            focus: "A focused authentication implementation demonstrating secure login validation and session handling — a foundation for access control in web applications."
        }
    };

    function initModal() {
        const modal = $("#projectModal");
        const title = $("#modalTitle");
        const subtitle = $("#modalSubtitle");
        const tech = $("#modalTech");
        const features = $("#modalFeatures");
        const focus = $("#modalFocus");
        if (!modal || !title) return;

        let lastFocused = null;
        const focusableSelector =
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

        function openModal(key) {
            const data = PROJECT_DATA[key];
            if (!data) return;

            lastFocused = document.activeElement;

            title.textContent = data.title;
            subtitle.textContent = data.subtitle;
            tech.innerHTML = "";
            data.tech.forEach((t) => {
                const span = document.createElement("span");
                span.textContent = t;
                tech.appendChild(span);
            });
            features.innerHTML = "";
            data.features.forEach((f) => {
                const li = document.createElement("li");
                li.textContent = f;
                features.appendChild(li);
            });
            focus.textContent = data.focus;

            modal.classList.add("is-open");
            modal.setAttribute("aria-hidden", "false");
            document.body.classList.add("no-scroll");
            const closeBtn = modal.querySelector(".modal-close");
            closeBtn.focus();
        }

        function closeModal() {
            modal.classList.remove("is-open");
            modal.setAttribute("aria-hidden", "true");
            document.body.classList.remove("no-scroll");
            if (lastFocused) lastFocused.focus();
        }

        // Open buttons
        $$("[data-project]").forEach((btn) => {
            btn.addEventListener("click", () => openModal(btn.dataset.project));
        });

        // Close via close button and backdrop
        $$("[data-close-modal]", modal).forEach((el) => {
            el.addEventListener("click", closeModal);
        });

        // Escape key closes modal
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && modal.classList.contains("is-open")) {
                closeModal();
            }
        });

        // Basic focus trap while the modal is open
        modal.addEventListener("keydown", (e) => {
            if (e.key !== "Tab" || !modal.classList.contains("is-open")) return;
            const focusables = $$(focusableSelector, modal).filter((el) => el.offsetParent !== null);
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        });
    }

    /* ------------------------------------------------------------------
       Footer year
       ------------------------------------------------------------------ */
    function initYear() {
        const el = $("#year");
        if (el) el.textContent = String(new Date().getFullYear());
    }

    /* ------------------------------------------------------------------
       Contact interaction (copy email)
       ------------------------------------------------------------------ */
    function initContactCopy() {
        const emailRow = document.querySelector('.contact-row[href^="mailto:"]');
        if (!emailRow || !navigator.clipboard) return;

        emailRow.setAttribute("role", "button");
        emailRow.setAttribute("aria-label", "Email fahadbhutta5833@gmail.com (click to copy)");
        emailRow.addEventListener("click", (e) => {
            e.preventDefault();
            const email = "fahadbhutta5833@gmail.com";
            navigator.clipboard.writeText(email).then(() => {
                const value = emailRow.querySelector(".contact-value");
                const original = value.textContent;
                value.textContent = "Email copied!";
                setTimeout(() => (value.textContent = original), 1800);
            });
        });
    }

    /* ------------------------------------------------------------------
       Init
       ------------------------------------------------------------------ */
    document.addEventListener("DOMContentLoaded", () => {
        initScrollState();
        initMobileNav();
        initReveal();
        initActiveNav();
        initSkillFilter();
        initModal();
        initYear();
        initContactCopy();
    });
})();

