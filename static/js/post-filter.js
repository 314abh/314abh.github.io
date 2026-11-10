(() => {
    "use strict";

    const form = document.querySelector("#post-filters");
    const list = document.querySelector("#post-list");
    const pagination = document.querySelector("#post-pagination");
    const status = document.querySelector("#post-results");
    const clearButton = document.querySelector("#clear-filters");

    if (!form || !list || !pagination || !status) {
        return;
    }

    const entries = Array.from(
        list.querySelectorAll("[data-post-entry]")
    );

    const checkboxes = Array.from(
        form.querySelectorAll('input[name="tag"]')
    );

    const pageSize = Number(list.dataset.pageSize) || 20;

    let currentPage = 1;


    // Read selected tags and page number from the URL.
    function readURL() {
        const params = new URLSearchParams(window.location.search);

        const selectedTags = new Set(params.getAll("tag"));

        checkboxes.forEach(checkbox => {
            checkbox.checked = selectedTags.has(checkbox.value);
        });

        const page = Number.parseInt(params.get("page") || "1", 10);

        currentPage = Number.isFinite(page) && page > 0 ? page : 1;
    }


    // Construct a URL representing the current filter state.
    function updateURL() {
        const url = new URL(window.location.href);

        url.searchParams.delete("tag");
        url.searchParams.delete("page");

        checkboxes
            .filter(checkbox => checkbox.checked)
            .forEach(checkbox => {
                url.searchParams.append("tag", checkbox.value);
            });

        if (currentPage > 1) {
            url.searchParams.set("page", currentPage);
        }

        window.history.pushState({}, "", url);
    }


    // Generate a pagination button.
    function makeButton(label, disabled, callback) {
        const button = document.createElement("button");

        button.type = "button";
        button.textContent = label;
        button.disabled = disabled;
        button.addEventListener("click", callback);

        return button;
    }


    // Render pagination controls.
    function renderPagination(totalPages) {
        pagination.replaceChildren();

        if (totalPages <= 1) {
            return;
        }

        const previous = makeButton(
            "Previous",
            currentPage === 1,
            () => {
                currentPage--;
                render(true);
            }
        );

        const next = makeButton(
            "Next",
            currentPage === totalPages,
            () => {
                currentPage++;
                render(true);
            }
        );

        const indicator = document.createElement("span");

        indicator.textContent =
            `Page ${currentPage} of ${totalPages}`;

        pagination.append(previous, indicator, next);
    }


    // Apply filters and render the current page.
    function render(pushURL = false) {

        const selectedTags = checkboxes
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);


        // AND semantics: every selected tag must be present.
        const matchingEntries = entries.filter(entry => {

            const postTags = new Set(
                (entry.dataset.tags || "")
                    .split(/\s+/)
                    .filter(Boolean)
            );

            return selectedTags.every(tag => postTags.has(tag));
        });


        const totalPages = Math.ceil(
            matchingEntries.length / pageSize
        );

        currentPage = Math.min(
            currentPage,
            Math.max(1, totalPages)
        );


        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, matchingEntries.length);

        const visibleEntries = new Set(
            matchingEntries.slice(start, end)
        );


        // Hide everything except the current page.
        entries.forEach(entry => {
            entry.hidden = !visibleEntries.has(entry);
        });


        // Update the result count.
        status.textContent = matchingEntries.length
            ? `Showing ${start + 1}–${end} of ${matchingEntries.length} posts`
            : "No posts match the selected tags.";


        renderPagination(totalPages);

        if (pushURL) {
            updateURL();
        }
    }


    // Changing a filter resets pagination.
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", () => {
            currentPage = 1;
            render(true);
        });
    });


    // Clear all selected tags.
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });

            currentPage = 1;
            render(true);
        });
    }


    // Support browser back/forward navigation.
    window.addEventListener("popstate", () => {
        readURL();
        render();
    });


    // Initialise the archive.
    readURL();
    render();

})();

