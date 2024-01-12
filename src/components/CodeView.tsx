import React, { useEffect, useRef } from 'react';
import { UnControlled } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/lint';
import CodeMirror from 'codemirror';
import './codeview.css'
import { instructions } from '../data/Machine';

export const validateCode: () => boolean = () => {
    return (document.querySelectorAll('.cm-invalid').length === 0) && (document.querySelectorAll('.cm-keyword').length > 0);
}

interface CVProps {
    updateValue: (value: string) => void;
    highlightedLine: number
}

const CodeView: React.FC<CVProps> = ({ updateValue, highlightedLine }) => {
    const kw = instructions.join("|");

    const reg = new RegExp(`(${kw})\\b`);

    const editor = useRef<CodeMirror.Editor>();
    const wrapper = useRef<any>();

    const editorWillUnmount = () => {
        if (editor.current != null) (editor.current as any).display.wrapper.remove()
        if (wrapper.current != null) wrapper.current.hydrated = false;
    };

    CodeMirror.defineMode("scramble", () => {
        return {
            token: (stream) => {
                if (stream.match(reg)) {
                    return 'keyword'
                }
                stream.next();
                return 'invalid'
            },
        } as CodeMirror.Mode<unknown>;
    });

    CodeMirror.defineMIME('text/x-scramble', 'scramble');

    const options = {
        mode: 'scramble',
        theme: 'default',
        lineNumbers: true,
        lint: true,
        gutters: ['CodeMirror-lint-markers']
    };

    const customLinter = (text: string) => {
        const errors = [];
        const regex = new RegExp(`\\b(?:${kw})\\b`, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {}
        if (!match) {
            errors.push({
                from: CodeMirror.Pos(0, 0),
                to: CodeMirror.Pos(0, text.length),
                message: "Invalid syntax",
                severity: 'error'
            });
        }
    }

    useEffect( () => {
        if (editor.current !== undefined) {
            editor.current.getAllMarks().forEach ( m => m.clear() );
            if (highlightedLine !== -1) {
                const lines = editor.current.getValue().split('\n');
                const start = CodeMirror.Pos(highlightedLine, 0);
                const end = CodeMirror.Pos(highlightedLine, lines[highlightedLine].length);
                editor.current.markText(start, end, { className: 'cm-highlight' });
            }
        }
    }, [editor,highlightedLine])

    return (
        <div>
            <div className="border-2 border-blue-400 bg-blue-400" style={{ padding: '2px' }}>
                <UnControlled
                    ref={wrapper}
                    options={options}
                    value=""
                    onChange={
                        (editor, data, value) => {
                            // Handle changes if needed
                            customLinter(value);
                            updateValue(value);
                        }
                    }
                    className="border-2 border-blue-400 rounded-lg"
                    editorDidMount={(e, start, end) => {
                        editor.current = e;
                        e.getAllMarks()
                    }}
                    editorWillUnmount={editorWillUnmount}
                    />
            </div>
        </div>
    );
}

export default CodeView;