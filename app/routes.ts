import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/layout.tsx", [
    index("routes/home.tsx"),

    route("login", "routes/login.tsx"),
    route("signup", "routes/signup.tsx"),

    route("browse", "routes/browse/index.tsx"),
    route("browse/:division", "routes/browse/division.tsx"),
    route("browse/:division/:class", "routes/browse/class.tsx"),
    route("browse/:division/:class/:order", "routes/browse/order.tsx"),
    route("browse/:division/:class/:order/:family", "routes/browse/family.tsx"),
    route("browse/:division/:class/:order/:family/:genus", "routes/browse/genus.tsx"),
    route("browse/:division/:class/:order/:family/:genus/:species", "routes/browse/species.tsx"),

    route("recipes", "routes/recipes/index.tsx"),
    route("recipes/create", "routes/recipes/create.tsx"),
    route("recipes/:recipeId", "routes/recipes/recipe.tsx"),

    route("experiments", "routes/experiments/index.tsx"),
    route("experiments/:recipeId/:experimentId", "routes/experiments/experiment.tsx"),
  ]),
] satisfies RouteConfig;
