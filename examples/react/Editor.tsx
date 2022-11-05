/* Copyright 2021, Prosemirror Adapter by Mirone. */
import './Editor.css';

import { NodeViewContent, reactNodeViewFactory } from '@prosemirror-adapter/react';
import { EditorView } from 'prosemirror-view';
import { FC, ReactPortal, useCallback, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';

import { createEditorView } from './prosemirror';

const Paragraph = () => {
    return <NodeViewContent as="span" />;
};

export const Editor: FC = () => {
    const viewRef = useRef<EditorView>();
    const [portals, setPortals] = useState<Record<string, ReactPortal>>({});

    const mountedRef = useRef(false);

    useLayoutEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const maybeFlushSync = useCallback((fn: () => void) => {
        if (mountedRef.current) {
            flushSync(fn);
        } else {
            fn();
        }
    }, []);

    const editorRef = useCallback(
        (element: HTMLDivElement) => {
            if (!element) return;

            if (element.firstChild) return;

            viewRef.current = createEditorView(element, {
                paragraph(node, view, getPos, decorations, innerDecorations) {
                    const nodeView = reactNodeViewFactory({
                        component: Paragraph,
                        node,
                        view,
                        getPos,
                        decorations,
                        innerDecorations,
                        options: {
                            as: 'p',
                            contentAs: 'span',
                            destroy: () => {
                                maybeFlushSync(() => {
                                    setPortals((prev) => {
                                        const { [nodeView.key]: _, ...rest } = prev;

                                        return rest;
                                    });
                                });
                            },
                        },
                    });

                    const portal = nodeView.render();
                    maybeFlushSync(() => {
                        setPortals((prev) => ({
                            ...prev,
                            [nodeView.key]: portal,
                        }));
                    });

                    return nodeView;
                },
            });
        },
        [maybeFlushSync],
    );

    return (
        <>
            <div className="editor" ref={editorRef} />
            {Object.values(portals)}
        </>
    );
};
