export function keyboard(node: HTMLElement, handlers: Record<string, () => void>) {
    function handleKeydown(event: KeyboardEvent) {
        // Don't interfere with input typing
        if (event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement) {
            return;
        }

        // Skip if any modifier keys are pressed (let system handle them)
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }

        const key = event.key.toLowerCase();

        // Handle simple keys only
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