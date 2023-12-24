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

    rules: { [key: string]: string } = {};

    exemptedNodes: csstree.CssNode [] = []; // rules in Atrules (@media screen and (max-width ...))

    constructor(css: string) {
        this.ast = csstree.parse(css);
        this.parse();
    }

    parse() {
        this.rules = this.identifiers = this.classes = this.types = {};
        
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
                        // rule block as string for inlining
                        const blockString = csstree.generate(node.block).slice(1, -1);

                        // selector / .class#id > div
                        const selector = csstree.generate(node.prelude);
                        let selectors = node.prelude.children;

                        //console.log("SLCTOR: " + selector, "BLOCK: " + blockString)
                        appendTo(this.rules, selector, blockString);

                        for (const selector of selectors) {
                            switch (selector.type) {
                                case "Selector":
                                    const children = selector.children;

                                    // only handle basic/single selection conditions
                                    if (children.size > 1) continue;
                                    //console.log(children)

                                    for (const child of children) {

                                        // {height:100vh;filter:hue-rotate(180deg)} -> height:100vh;filter:hue-rotate(180deg)

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
                                            
                                            // combinator (" ", ">")
                                            case "Combinator":
                                                continue;

                                            default:
                                                console.warn(child.type + " not implemented!");
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
        //console.log(this.rules)
    }

    traverse(func: Function) {
        csstree.walk(this.ast, (node, options) => func(node, options));
    }
}

export {
    CSS
};