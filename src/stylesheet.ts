import * as csstree from 'css-tree';

function appendTo(map: { [key: string]: any; }, key: string, value: string) {
    // nullish coalescing / assign value if null
    map[key] ??= [];

    map[key].push(value.split("\"").join("'"));
}

class CSS {
    ast: csstree.CssNode;

    types: { [key: string]: any; } = {};
    classes: { [key: string]: any; } = {};
    identifiers: { [key: string]: any; } = {};

    exemptedNodes: csstree.CssNode [] = []; // rules in Atrules (@media screen and (max-width ...))

    constructor(css: string) {
        this.ast = csstree.parse(css);
        this.parse();
    }

    parse() {
        this.traverse((node: csstree.CssNode, options: csstree.ListItem<csstree.CssNode>) => {
            switch (node.type) {
                case "Block":
                    const children = node.children;

                    for (const child of children) {
                        if (child.type == "Rule") this.exemptedNodes.push(child);
                    }
                    break;
                case "Rule":
                    if (this.exemptedNodes.includes(node)) break;

                    if (node.prelude.type == "SelectorList") {
                        let selectors = node.prelude.children;

                        for (const selector of selectors) {
                            switch (selector.type) {
                                case "Selector":
                                    const children = selector.children;

                                    // .field:focus / pseudo elements can't be inlined without js
                                    if (children.size > 1) continue;
                                    //console.log(children)

                                    for (const child of children) {

                                        // rule block as string for inlining
                                        // {height:100vh;filter:hue-rotate(180deg)} -> height:100vh;filter:hue-rotate(180deg)
                                        const blockString = csstree.generate(node.block).slice(1, -1);

                                        switch (child.type) {
                                            // body { ... }
                                            case "TypeSelector":
                                                appendTo(this.types, child.name, blockString);
                                                break;

                                            // .class { ... }
                                            case "ClassSelector":
                                                appendTo(this.classes, child.name, blockString);
                                                break;

                                            // #identifier { ... }
                                            case "IdSelector":
                                                appendTo(this.identifiers, child.name, blockString);
                                                break;
                                            default:
                                                continue;
                                        }
                                    }
                                    break;
                                default:
                                    console.warn(selector.type + " not implemented!");

                            }
                        }
                    }
                    break;
            }
        });
    }

    traverse(func: Function) {
        csstree.walk(this.ast, (node, options) => func(node, options));
    }
}

export {
    CSS
};