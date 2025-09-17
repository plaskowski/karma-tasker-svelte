export function keyboard(node: HTMLElement, handlers: Record<string, () => void>) {
    function handleKeydown(event: KeyboardEvent) {
        // Don't interfere with input typing
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement) {
            return;
        }

        const key = event.key.toLowerCase();
        const modifierKey = event.ctrlKey || event.metaKey;

        // Handle modified keys (ctrl+n, cmd+n)
        if (modifierKey && handlers[`${key}+mod`]) {
            event.preventDefault();
            handlers[`${key}+mod`]();
            return;
        }

        // Handle simple keys (n)
        if (handlers[key]) {
            event.preventDefault();
            handlers[key]();
        }
    }

    node.addEventListener('keydown', handleKeydown);

    return {
        update(newHandlers: Record<string, () => void>) {
            handlers = newHandlers;
        },
        destroy() {
            node.removeEventListener('keydown', handleKeydown);
        }
    };
}