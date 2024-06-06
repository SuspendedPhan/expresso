## Expr to enum

ExprBase
    - parent: Expr
    - replace(expr)
        - parent.replaceChild(expr)

Expr
    - NumberExpr(value, parent)
    - PrimitiveFunctionCallExpr(name, args, parent)
        - replaceChild(expr)

    - parent: Expr
    
    - replace(newExpr)
        - switch parent
            - case ExprBase
                - parent.replace(newExpr)
            - case PrimitiveFunctionCallExpr
                - parent.replaceChild(newExpr)



Expr