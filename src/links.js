// One registry for every outbound link. `null` means "not available yet": the page shows plain text with a "Soon" chip.
// Only the whitepaper (GitBook) exists today. Fill the rest in here and nothing else needs to change.
export const LINKS = {
    whitepaper: 'https://flowfi.gitbook.io/flowfi',
    app: null,
    dao: null,
    forum: null,
    snapshot: null,
    audit: null,
    grants: null,
    terms: null,
    privacy: null
};

/** Turns `<a data-link="x">` into a link when LINKS.x is set, or into plain text with a Soon chip when it is not. */
export function wireLinks() {
    document.querySelectorAll('a[data-link]').forEach((a) => {
        const url = LINKS[a.dataset.link];
        if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; return; }
        const span = document.createElement('span');
        span.className = (a.className + ' soon').trim();
        span.innerHTML = a.innerHTML + ' <em class="chip" data-i18n="common.soon">Soon</em>';
        a.replaceWith(span);
    });
}
