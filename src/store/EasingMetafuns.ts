import * as d3 from "d3";

export default [
  {
    name: "EaseQuadIn",
    paramCount: 1,
    eval: (t) => {
      return d3.easeQuadIn(t.eval());
    },
  },
  {
    name: "EaseQuadOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeQuadOut(t.eval());
    },
  },
  {
    name: "EaseQuadInOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeQuadInOut(t.eval());
    },
  },

  {
    name: "EaseCubicIn",
    paramCount: 1,
    eval: (t) => {
      return d3.easeCubicIn(t.eval());
    },
  },
  {
    name: "EaseCubicOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeCubicOut(t.eval());
    },
  },
  {
    name: "EaseCubicInOut",
    paramCount: 1,
    eval: (t) => {
      return d3.easeCubicInOut(t.eval());
    },
  },

  {
    name: "EasePolyIn",
    paramCount: 2,
    eval: (t, exponent) => {
      return d3.easePolyIn.exponent(exponent.eval())(t.eval());
    },
  },
  {
    name: "EasePolyOut",
    paramCount: 2,
    eval: (t, exponent) => {
      return d3.easePolyOut.exponent(exponent.eval())(t.eval());
    },
  },
  {
    name: "EasePolyInOut",
    paramCount: 2,
    eval: (t, exponent) => {
      return d3.easePolyInOut.exponent(exponent.eval())(t.eval());
    },
  },
];
