import * as d3 from "d3";

export default [
  {
    name: "EaseQuadIn",
    paramCount: 1,
    eval: (t) => {
      return d3.easeQuadIn(t);
    },
  },
  {
    name: "EaseQuadOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeQuadOut(t);
    },
  },
  {
    name: "EaseQuadInOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeQuadInOut(t);
    },
  },

  {
    name: "EaseCubicIn",
    paramCount: 1,
    eval: (t) => {
      return d3.easeCubicIn(t);
    },
  },
  {
    name: "EaseCubicOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeCubicOut(t);
    },
  },
  {
    name: "EaseCubicInOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeCubicInOut(t);
    },
  },

  {
    name: "EasePolyIn",
    paramCount: 2,
    eval: (t, exponent) => {
      return d3.easePolyIn.exponent(exponent)(t);
    },
  },
  {
    name: "EasePolyOut",
    paramCount: 2,
    eval: (t, exponent) => {
      return d3.easePolyOut.exponent(exponent)(t);
    },
  },
  {
    name: "EasePolyInOut",
    paramCount: 2,
    eval: (t, exponent) => {
      return d3.easePolyInOut.exponent(exponent)(t);
    },
  },
];
