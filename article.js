/* =========================================================
   STORYVERSE - ARTICLE READER
   Full article view + sharing + related articles
========================================================= */

const StoryArticle = (() => {

    let currentArticle = null;


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        if (
            value === null ||
            value === undefined
        ) {
            return "";
        }

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* =====================================================
       GET ARTICLE
    ===================================================== */

    function findArticle(id) {

        if (
            typeof getArticleById ===
            "function"
        ) {
            return getArticleById(id);
        }


        if (
            typeof getAllArticles ===
            "function"
        ) {

            const articles =
                getAllArticles();

            return articles.find(
                article =>
                    String(article.id) ===
                    String(id)
            );
        }


        return null;
    }


    /* =====================================================
       OPEN ARTICLE
    ===================================================== */

    function openArticleById(id) {

        const article =
            findArticle(id);


        if (!article) {

            showMessage(
                "Article not found"
            );

            return;
        }


        currentArticle =
            article;


        /*
           If the page contains an article
           reader, display the article there.
        */

        const reader =
            document.querySelector(
                "#article-reader"
            );


        if (reader) {

            renderArticle(
                article,
                reader
            );

            reader.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

            return;
        }


        /*
           If there is a dedicated article page,
           open it.
        */

        if (
            window.location.pathname
                .toLowerCase()
                .endsWith("article.html")
        ) {

            renderArticlePage(
                article
            );

            return;
        }


        /*
           Otherwise use a URL parameter.
        */

        const url =
            `article.html?id=${encodeURIComponent(
                article.id
            )}`;

        window.location.href =
            url;
    }


    /* =====================================================
       RENDER ARTICLE
    ===================================================== */

    function renderArticle(
        article,
        container
    ) {

        const title =
            escapeHTML(
                article.title
            );


        const category =
            escapeHTML(
                article.category ||
                "Story"
            );


        const author =
            escapeHTML(
                article.author ||
                "StoryVerse"
            );


        const date =
            escapeHTML(
                article.date ||
                ""
            );


        const readTime =
            escapeHTML(
                article.readTime ||
                "5 min read"
            );


        const image =
            article.image ||
            "";


        const content =
            article.content ||
            article.body ||
            article.description ||
            "Article content coming soon.";


        const tags =
            Array.isArray(
                article.tags
            )
                ? article.tags
                : [];


        container.innerHTML = `

            <article
                class="full-article"
                data-current-article="${article.id}"
            >

                <div class="article-reader-top">

                    <button
                        type="button"
                        class="back-to-articles"
                        id="back-to-articles"
                    >
                        ← Back to Articles
                    </button>

                </div>


                <header
                    class="full-article-header"
                >

                    <span class="article-category">
                        ${category}
                    </span>


                    <h1>
                        ${title}
                    </h1>


                    <p class="article-subtitle">
                        ${escapeHTML(
                            article.description || ""
                        )}
                    </p>


                    <div class="full-article-meta">

                        <span>
                            ✍️ ${author}
                        </span>

                        <span>
                            📅 ${date}
                        </span>

                        <span>
                            ⏱️ ${readTime}
                        </span>

                    </div>


                    <div class="article-actions">

                        <button
                            type="button"
                            class="bookmark-btn"
                            data-bookmark-id="${article.id}"
                            title="Save article"
                        >
                            <span class="bookmark-icon">
                                🔖
                            </span>

                            <span>
                                Save
                            </span>
                        </button>


                        <button
                            type="button"
                            class="article-share-btn"
                            id="share-article"
                        >
                            📤 Share
                        </button>

                    </div>

                </header>


                ${
                    image
                        ? `
                            <div
                                class="full-article-image"
                            >
                                <img
                                    src="${image}"
                                    alt="${title}"
                                >
                            </div>
                        `
                        : ""
                }


                <div
                    class="article-content"
                    id="article-content"
                >
                    ${formatArticleContent(
                        content
                    )}
                </div>


                ${
                    tags.length
                        ? `
                            <div class="article-tags">

                                <strong>
                                    Tags:
                                </strong>

                                ${tags
                                    .map(
                                        tag =>
                                            `
                                            <span class="article-tag">
                                                ${escapeHTML(tag)}
                                            </span>
                                            `
                                    )
                                    .join("")}

                            </div>
                        `
                        : ""
                }


                <div
                    class="article-share-section"
                >

                    <h3>
                        Enjoyed this article?
                    </h3>

                    <p>
                        Share it with your friends.
                    </p>


                    <div
                        class="share-buttons"
                    >

                        <button
                            type="button"
                            data-share="copy"
                        >
                            📋 Copy Link
                        </button>

                        <button
                            type="button"
                            data-share="native"
                        >
                            📤 Share
                        </button>

                    </div>

                </div>


                <section
                    class="related-articles"
                    id="related-articles"
                >

                    <h2>
                        You May Also Like
                    </h2>

                    <div
                        class="related-articles-grid"
                    >
                        ${renderRelatedArticles(
                            article
                        )}
                    </div>

                </section>

            </article>
        `;


        attachArticleEvents(
            article
        );


        updateBookmarkState(
            article.id
        );
    }


    /* =====================================================
       FORMAT ARTICLE CONTENT
    ===================================================== */

    function formatArticleContent(
        content
    ) {

        if (
            typeof content !==
            "string"
        ) {

            return "";
        }


        /*
           If the content already contains HTML,
           preserve common article formatting
           while escaping unsafe script elements.
        */

        let safeContent =
            content
                .replace(
                    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
                    ""
                )
                .replace(
                    /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
                    ""
                );


        /*
           Convert simple markdown-style
           formatting.
        */

        safeContent =
            safeContent
                .replace(
                    /^### (.*)$/gm,
                    "<h3>$1</h3>"
                )
                .replace(
                    /^## (.*)$/gm,
                    "<h2>$1</h2>"
                )
                .replace(
                    /^# (.*)$/gm,
                    "<h1>$1</h1>"
                )
                .replace(
                    /\*\*(.*?)\*\*/g,
                    "<strong>$1</strong>"
                )
                .replace(
                    /\*(.*?)\*/g,
                    "<em>$1</em>"
                );


        /*
           Convert normal line breaks into
           paragraphs when no HTML paragraphs exist.
        */

        if (
            !/<(p|div|h1|h2|h3|ul|ol|blockquote|pre)\b/i
                .test(safeContent)
        ) {

            safeContent =
                safeContent
                    .split(/\n\s*\n/)
                    .map(
                        paragraph =>
                            `<p>${paragraph
                                .trim()
                                .replace(
                                    /\n/g,
                                    "<br>"
                                )}</p>`
                    )
                    .join("");
        }


        return safeContent;
    }


    /* =====================================================
       RELATED ARTICLES
    ===================================================== */

    function renderRelatedArticles(
        article
    ) {

        if (
            typeof getAllArticles !==
            "function"
        ) {
            return "";
        }


        const articles =
            getAllArticles();


        let related =
            articles.filter(
                item =>
                    String(item.id) !==
                    String(article.id)
            );


        /*
           Prefer articles from the
           same category.
        */

        const sameCategory =
            related.filter(
                item =>
                    item.category &&
                    article.category &&
                    item.category.toLowerCase() ===
                    article.category.toLowerCase()
            );


        if (sameCategory.length) {

            related =
                [
                    ...sameCategory,
                    ...related.filter(
                        item =>
                            !sameCategory.includes(
                                item
                            )
                    )
                ];
        }


        related =
            related.slice(0, 3);


        return related
            .map(
                item =>
                    `
                    <article
                        class="related-article-card"
                    >

                        ${
                            item.image
                                ? `
                                    <img
                                        src="${item.image}"
                                        alt="${escapeHTML(
                                            item.title
                                        )}"
                                        loading="lazy"
                                    >
                                `
                                : ""
                        }


                        <div>

                            <span>
                                ${escapeHTML(
                                    item.category ||
                                    ""
                                )}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    item.title
                                )}
                            </h3>

                            <button
                                type="button"
                                data-related-id="${item.id}"
                            >
                                Read →
                            </button>

                        </div>

                    </article>
                    `
            )
            .join("");
    }


    /* =====================================================
       ATTACH EVENTS
    ===================================================== */

    function attachArticleEvents(
        article
    ) {

        const backButton =
            document.querySelector(
                "#back-to-articles"
            );


        if (backButton) {

            backButton.addEventListener(
                "click",
                () => {

                    const articlesSection =
                        document.querySelector(
                            "#articles"
                        );


                    if (
                        articlesSection
                    ) {

                        articlesSection.scrollIntoView({
                            behavior:
                                "smooth"
                        });

                    } else {

                        window.history.back();
                    }
                }
            );
        }


        const shareButton =
            document.querySelector(
                "#share-article"
            );


        if (shareButton) {

            shareButton.addEventListener(
                "click",
                () => {

                    shareArticle(
                        article
                    );
                }
            );
        }


        const copyButton =
            document.querySelector(
                '[data-share="copy"]'
            );


        if (copyButton) {

            copyButton.addEventListener(
                "click",
                () => {

                    copyArticleLink(
                        article
                    );
                }
            );
        }


        const nativeButton =
            document.querySelector(
                '[data-share="native"]'
            );


        if (nativeButton) {

            nativeButton.addEventListener(
                "click",
                () => {

                    shareArticle(
                        article
                    );
                }
            );
        }


        const relatedButtons =
            document.querySelectorAll(
                "[data-related-id]"
            );


        relatedButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openArticleById(
                            button.dataset.relatedId
                        );
                    }
                );
            }
        );
    }


    /* =====================================================
       SHARE ARTICLE
    ===================================================== */

    async function shareArticle(
        article
    ) {

        const shareData = {

            title:
                article.title ||
                "StoryVerse Article",

            text:
                article.description ||
                "Read this article on StoryVerse.",

            url:
                createArticleURL(
                    article.id
                )
        };


        if (
            navigator.share
        ) {

            try {

                await navigator.share(
                    shareData
                );

                showMessage(
                    "Article shared"
                );

                return;

            } catch (error) {

                /*
                   User cancelled sharing.
                   Do nothing.
                */

                if (
                    error &&
                    error.name ===
                    "AbortError"
                ) {
                    return;
                }
            }
        }


        copyArticleLink(
            article
        );
    }


    /* =====================================================
       COPY ARTICLE LINK
    ===================================================== */

    async function copyArticleLink(
        article
    ) {

        const url =
            createArticleURL(
                article.id
            );


        try {

            await navigator.clipboard.writeText(
                url
            );

            showMessage(
                "Article link copied 📋"
            );

        } catch (error) {

            /*
               Fallback for older browsers.
            */

            const textarea =
                document.createElement(
                    "textarea"
                );


            textarea.value =
                url;


            textarea.style.position =
                "fixed";

            textarea.style.opacity =
                "0";


            document.body.appendChild(
                textarea
            );


            textarea.select();


            try {

                document.execCommand(
                    "copy"
                );

                showMessage(
                    "Article link copied 📋"
                );

            } catch (copyError) {

                showMessage(
                    "Unable to copy link"
                );
            }


            textarea.remove();
        }
    }


    /* =====================================================
       CREATE ARTICLE URL
    ===================================================== */

    function createArticleURL(
        id
    ) {

        return `${window.location.origin}${window.location.pathname
            .replace(
                /\/[^/]*$/,
                "/article.html"
            )}?id=${encodeURIComponent(id)}`;
    }


    /* =====================================================
       UPDATE BOOKMARK STATE
    ===================================================== */

    function updateBookmarkState(
        articleId
    ) {

        if (
            typeof StoryBookmarks !==
            "undefined" &&
            StoryBookmarks.isSaved
        ) {

            const button =
                document.querySelector(
                    `[data-bookmark-id="${articleId}"]`
                );


            if (button) {

                const saved =
                    StoryBookmarks.isSaved(
                        articleId
                    );


                button.classList.toggle(
                    "bookmarked",
                    saved
                );


                button.setAttribute(
                    "aria-pressed",
                    saved
                        ? "true"
                        : "false"
                );


                const icon =
                    button.querySelector(
                        ".bookmark-icon"
                    );


                if (icon) {

                    icon.textContent =
                        saved
                            ? "🔖"
                            : "♡";
                }
            }
        }
    }


    /* =====================================================
       SHOW MESSAGE
    ===================================================== */

    function showMessage(
        message
    ) {

        if (
            typeof showToast ===
            "function"
        ) {

            showToast(
                message
            );

            return;
        }


        let toast =
            document.querySelector(
                "#storyverse-article-toast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );


            toast.id =
                "storyverse-article-toast";


            toast.className =
                "storyverse-toast";


            document.body.appendChild(
                toast
            );
        }


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2000
        );
    }


    /* =====================================================
       RENDER ARTICLE PAGE
    ===================================================== */

    function renderArticlePage(
        article
    ) {

        const container =
            document.querySelector(
                "#article-reader"
            );


        if (!container) {

            return;
        }


        renderArticle(
            article,
            container
        );
    }


    /* =====================================================
       LOAD ARTICLE FROM URL
    ===================================================== */

    function loadFromURL() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            params.get("id");


        if (!id) {
            return;
        }


        const article =
            findArticle(id);


        if (!article) {

            showMessage(
                "Article not found"
            );

            return;
        }


        currentArticle =
            article;


        renderArticlePage(
            article
        );
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    function initialize() {

        /*
           Only attempt URL loading on an
           article page.
        */

        if (
            window.location.pathname
                .toLowerCase()
                .endsWith("article.html")
        ) {

            loadFromURL();
        }
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    return {

        initialize,

        open:
            openArticleById,

        getCurrent:
            () => currentArticle,

        share:
            shareArticle,

        copyLink:
            copyArticleLink
    };

})();


/* =========================================================
   GLOBAL ARTICLE FUNCTION
   Other StoryVerse modules can use this.
========================================================= */

function openArticleById(id) {

    StoryArticle.open(id);
}


/* =========================================================
   START ARTICLE SYSTEM
========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        () => {

            StoryArticle.initialize();

        },
        { once: true }
    );

} else {

    StoryArticle.initialize();
}