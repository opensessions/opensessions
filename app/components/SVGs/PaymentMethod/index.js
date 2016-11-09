/* eslint-disable-file no-nested-ternary */
import React, { PropTypes } from 'react';

export default class PaymentMethodSVG extends React.Component { // eslint-disable-line react/prefer-stateless-function
  static propTypes = {
    cash: PropTypes.bool,
    card: PropTypes.bool
  }
  renderCard() {
    return (<g>
      <path fill="inherit" d="M126.912,0.011H50.84c-4.551,0-8.418,2.932-9.844,6.998c-1.396-0.639-2.818-1.175-4.688-1.903 c-6.377-2.479-11.716-2.11-17.788,0.943c-5.23,2.632-8.92,7.129-11.705,12.16c-1.541,2.783-2.893,5.667-4.416,8.462 C1.144,28.979,0,30.716,0,33.369c0,15.74,0,31.48,0,47.222c0,2.161,1.798,3.944,3.954,3.955c8.875,0.038,17.78-0.092,26.638-0.715 c3.979-0.282,8.072-0.508,11.744-2.172c3.278-1.488,6.302-3.662,9.226-5.733c0.052-0.035,0.103-0.074,0.151-0.11 c0.524,0.997,1.133,2.027,1.878,3.191c2.601,4.071,7.938,4.071,11.721,1.773c1.521-0.924,2.588-2.229,3.32-3.768 c0.433,0.63,0.882,1.255,1.361,1.857c2.862,3.597,8.035,3.477,11.514,0.835c1.402-1.062,2.351-2.397,2.973-3.903 c0.212,0.26,0.424,0.522,0.645,0.777c3.228,3.726,8.671,2.095,11.885-0.566c3.294-2.729,2.978-7.039,2.478-10.84h27.426 c5.754,0,10.438-4.682,10.438-10.438V10.449C137.35,4.694,132.666,0.011,126.912,0.011z M61.562,73.554 c-0.069,0.396-0.854,0.91-1.423,0.946c-0.014-0.052-0.18-0.213-0.422-0.619c-0.491-0.818-0.908-1.681-1.321-2.543 c-0.059-0.12-0.109-0.246-0.167-0.369c1.261-0.984,2.501-1.995,3.73-3.021C61.987,69.852,61.877,71.732,61.562,73.554z  M67.825,51.394c-3.497,3.92-7.408,7.469-11.419,10.852c-3.664,3.092-7.492,5.988-11.464,8.671 c-1.479,0.999-2.991,1.953-4.539,2.841c-0.587,0.334-1.188,0.65-1.797,0.949c-0.044,0.02-0.123,0.057-0.207,0.094 c-0.208,0.078-0.413,0.15-0.625,0.21c-5.899,1.647-12.962,1.286-19.152,1.453c-3.57,0.098-7.141,0.144-10.715,0.158 c0-13.414,0-26.829,0-40.244c0-1.18,0-2.358,0-3.535c0.103-0.095,0.239-0.272,0.431-0.601c0.881-1.502,1.688-3.047,2.488-4.593 c2.404-4.645,4.499-9.393,8.572-12.834c2.031-1.718,4.939-3.09,7.523-3.654c2.037-0.444,4.723,0.668,6.594,1.318 c2.368,0.817,4.683,1.933,6.884,3.19V40.87c-3.138,1.825-6.182,3.817-9.078,5.94c-4.067,2.981-0.13,9.849,3.991,6.828 c6.303-4.62,13.31-8.71,20.555-11.626c4.54-1.829,9.996-3.707,14.956-2.793c0.945,0.176,1.832,0.475,2.675,0.922 c0.273,0.145,0.441,0.287,0.522,0.364c0.028,0.055,0.06,0.119,0.089,0.184c0.062,0.297,0.105,0.73,0.049,0.109 c0,0.001,0,0.002,0,0.003c0.1,0.968,0.113,0.211-0.218,1.416C73.15,45.106,70.22,48.711,67.825,51.394z M74.143,40.638 c0.004,0.05,0.008,0.091,0.012,0.133c0,0,0-0.001,0-0.002C74.15,40.728,74.146,40.688,74.143,40.638z M77.361,72.751 c-0.002,0.043-0.002,0.072-0.002,0.108c-0.037,0.036-0.076,0.079-0.123,0.136c-0.36,0.438-0.847,0.744-1.421,0.78 c0.228-0.015-1.151-1.91-1.594-2.631c-1.173-1.906-2.18-3.919-3.088-5.972h5.805C77.289,67.719,77.457,70.255,77.361,72.751z  M90.586,70.856c-0.069-0.089-0.166-0.211-0.312-0.377c-0.57-0.657-1.044-1.393-1.529-2.113c-0.693-1.033-1.334-2.103-1.94-3.193 h4.777c0.201,1.476,0.322,2.953,0.328,4.43C91.912,70.139,91.338,70.774,90.586,70.856z M131.655,54.734 c0,2.617-2.129,4.745-4.743,4.745H98.468h-8.03h-6.471h-8.59h-4.298c1.324-1.379,2.622-2.782,3.853-4.234 c4.312-5.093,11.16-14.834,4.215-20.74c-8-6.802-20.617-2.26-28.935,1.375c-1.384,0.606-2.755,1.257-4.118,1.934v-8.402h85.562 V54.734z M131.655,14.816H46.094v-4.367c0-2.615,2.129-4.744,4.746-4.744h76.072c2.614,0,4.743,2.129,4.743,4.744V14.816z" />
      <rect x="96.557" y="37.771" fill="inherit" width="28.286" height="2.799" />
      <rect x="104.176" y="43.216" fill="inherit" width="20.557" height="2.799" />
    </g>);
  }
  renderCash() {
    return (<g>
      <g>
        <path fill="inherit" d="M71.493,8.328c3.086,1.079,5.658,2.398,7.72,3.965l-6.836,1.183c-1.668-1.27-3.405-2.222-5.229-2.868 c-1.229-0.438-2.475-0.651-3.729-0.636c-1.257,0.014-2.44,0.252-3.565,0.723l-3.94,1.64l8.918,3.231l-4.519,1.94l-8.938-3.293 l-2.995,1.246c-2.396,0.99-5.339,1.279-8.808,0.849l17.16,6.475l-5.603,2.42l-24.794-9.506l5.366-2.158 C33.9,13.88,35.709,14,37.098,13.89c1.406-0.108,2.816-0.443,4.219-1.021l3.047-1.236l-4.084-1.506l4.538-1.824l4.082,1.479 l3.992-1.621c2.715-1.098,5.664-1.634,8.875-1.6C64.979,6.591,68.209,7.178,71.493,8.328z" />
      </g>
      <g>
        <path fill="inherit" d="M42.957,71.266C15.057,71.266,0,63.34,0,55.887c0-2.25,1.238-5.586,7.136-8.719l1.504,2.836 c-3.5,1.857-5.429,3.947-5.429,5.883c0,5.754,16.323,12.168,39.746,12.168c23.426,0,39.751-6.414,39.751-12.168 c0-2.002-2.006-3.744-3.689-4.854l1.77-2.682c3.404,2.244,5.131,4.779,5.131,7.533C85.918,63.34,70.86,71.266,42.957,71.266z" />
      </g>
      <g>
        <g> <path id="SVGID_43_" fill="inherit" d="M85.933,55.844v14.875c0,7.656-19.231,13.879-42.954,13.879   c-23.721,0-42.947-6.223-42.947-13.879V55.844c0,7.668,19.227,13.879,42.947,13.879C66.7,69.723,85.933,63.512,85.933,55.844z" />
        </g>
        <g>
          <defs>
            <path id="SVGID_1_" d="M85.933,55.844v14.875c0,7.656-19.231,13.879-42.954,13.879c-23.721,0-42.947-6.223-42.947-13.879V55.844     c0,7.668,19.227,13.879,42.947,13.879C66.7,69.723,85.933,63.512,85.933,55.844z" />
          </defs>
          <clipPath id="SVGID_2_">
            <use xlinkHref="#SVGID_1_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_2_)" fill="inherit" d="M85.933,55.844v14.875c0,0.781-0.201,1.547-0.588,2.287V58.133   C85.729,57.385,85.933,56.621,85.933,55.844" />
        </g>
        <g>
          <defs>
            <path id="SVGID_3_" d="M85.933,55.844v14.875c0,7.656-19.231,13.879-42.954,13.879c-23.721,0-42.947-6.223-42.947-13.879V55.844     c0,7.668,19.227,13.879,42.947,13.879C66.7,69.723,85.933,63.512,85.933,55.844z" />
          </defs>
          <clipPath id="SVGID_4_">
            <use xlinkHref="#SVGID_3_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_4_)" fill="inherit" d="M85.345,58.133v14.873c-0.311,0.607-0.744,1.199-1.293,1.779V59.914   C84.601,59.328,85.034,58.74,85.345,58.133" />
        </g>
        <g>
          <defs>
            <path id="SVGID_5_" d="M85.933,55.844v14.875c0,7.656-19.231,13.879-42.954,13.879c-23.721,0-42.947-6.223-42.947-13.879V55.844     c0,7.668,19.227,13.879,42.947,13.879C66.7,69.723,85.933,63.512,85.933,55.844z" />
          </defs>
          <clipPath id="SVGID_6_">
            <use xlinkHref="#SVGID_5_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_6_)" fill="inherit" d="M84.052,59.914v14.871c-0.797,0.838-1.826,1.641-3.07,2.408V62.319   C82.226,61.557,83.255,60.75,84.052,59.914" />
        </g>
        <g>
          <defs>
            <path id="SVGID_7_" d="M85.933,55.844v14.875c0,7.656-19.231,13.879-42.954,13.879c-23.721,0-42.947-6.223-42.947-13.879V55.844     c0,7.668,19.227,13.879,42.947,13.879C66.7,69.723,85.933,63.512,85.933,55.844z" />
          </defs>
          <clipPath id="SVGID_8_">
            <use xlinkHref="#SVGID_7_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_8_)" fill="inherit" d="M80.979,62.319v14.875c-7.203,4.402-21.515,7.404-38.001,7.404   c-23.721,0-42.947-6.223-42.947-13.879V55.844c0,7.668,19.227,13.879,42.947,13.879C59.466,69.723,73.776,66.723,80.979,62.319" />
        </g>
      </g>
      <g>
        <g> <path fill="inherit" d="M42.955,50.041C15.057,50.041,0,42.118,0,34.659c0-2.681,1.725-6.597,9.943-10.037l1.241,2.959   c-5.066,2.123-7.974,4.703-7.974,7.078c0,5.756,16.321,12.173,39.744,12.173c23.426,0,39.753-6.417,39.753-12.173   c0-1.351-0.899-2.737-2.671-4.124l1.979-2.527c2.59,2.023,3.901,4.262,3.901,6.651C85.918,42.118,70.86,50.041,42.955,50.041z" />
        </g>
      </g>
      <g>
        <g> <path id="SVGID_45_" fill="inherit" d="M85.933,34.482v14.874c0,7.662-19.231,13.883-42.954,13.883   c-23.721,0-42.947-6.221-42.947-13.883V34.482c0,7.663,19.227,13.881,42.947,13.881C66.7,48.364,85.933,42.145,85.933,34.482z" />
        </g>
        <g>
          <defs>
            <path id="SVGID_9_" d="M85.933,34.482v14.874c0,7.662-19.231,13.883-42.954,13.883c-23.721,0-42.947-6.221-42.947-13.883V34.482     c0,7.663,19.227,13.881,42.947,13.881C66.7,48.364,85.933,42.145,85.933,34.482z" />
          </defs>
          <clipPath id="SVGID_10_">
            <use xlinkHref="#SVGID_9_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_10_)" fill="inherit" d="M85.933,34.482v14.874c0,0.779-0.201,1.547-0.588,2.285V36.77   C85.729,36.022,85.933,35.262,85.933,34.482" />
        </g>
        <g>
          <defs>
            <path id="SVGID_11_" d="M85.933,34.482v14.874c0,7.662-19.231,13.883-42.954,13.883c-23.721,0-42.947-6.221-42.947-13.883     V34.482c0,7.663,19.227,13.881,42.947,13.881C66.7,48.364,85.933,42.145,85.933,34.482z" />
          </defs>
          <clipPath id="SVGID_12_">
            <use xlinkHref="#SVGID_11_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_12_)" fill="inherit" d="M85.345,36.77v14.871c-0.311,0.609-0.744,1.203-1.293,1.783V38.553   C84.601,37.973,85.034,37.374,85.345,36.77" />
        </g>
        <g>
          <defs>
            <path id="SVGID_13_" d="M85.933,34.482v14.874c0,7.662-19.231,13.883-42.954,13.883c-23.721,0-42.947-6.221-42.947-13.883     V34.482c0,7.663,19.227,13.881,42.947,13.881C66.7,48.364,85.933,42.145,85.933,34.482z" />
          </defs>
          <clipPath id="SVGID_14_">
            <use xlinkHref="#SVGID_13_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_14_)" fill="inherit" d="M84.052,38.553v14.871c-0.797,0.838-1.826,1.646-3.07,2.412V40.957   C82.226,40.197,83.255,39.388,84.052,38.553" />
        </g>
        <g>
          <defs>
            <path id="SVGID_15_" d="M85.933,34.482v14.874c0,7.662-19.231,13.883-42.954,13.883c-23.721,0-42.947-6.221-42.947-13.883     V34.482c0,7.663,19.227,13.881,42.947,13.881C66.7,48.364,85.933,42.145,85.933,34.482z" />
          </defs>
          <clipPath id="SVGID_16_">
            <use xlinkHref="#SVGID_15_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_16_)" fill="inherit" d="M80.979,40.957v14.879c-7.203,4.402-21.515,7.4-38.001,7.4   c-23.721,0-42.947-6.219-42.947-13.883V34.482c0,7.663,19.227,13.881,42.947,13.881C59.466,48.364,73.776,45.36,80.979,40.957" />
        </g>
      </g>
      <g>
        <g> <path fill="inherit" d="M52.771,30.797c-27.914,0-42.977-7.928-42.977-15.384c0-7.447,15.062-15.366,42.977-15.366   c27.916,0,42.981,7.919,42.981,15.366C95.752,22.869,80.687,30.797,52.771,30.797z M52.771,3.258   c-23.436,0-39.767,6.405-39.767,12.155c0,5.76,16.331,12.172,39.767,12.172c23.438,0,39.771-6.412,39.771-12.172   C92.541,9.663,76.209,3.258,52.771,3.258z" />
        </g>
      </g>
      <g>
        <g> <path id="SVGID_47_" fill="inherit" d="M95.752,15.413v14.762c0,7.606-19.228,13.777-42.946,13.777   c-23.713,0-42.94-6.17-42.94-13.777V15.413c0,7.608,19.229,13.776,42.94,13.776C76.524,29.19,95.752,23.022,95.752,15.413z" />
        </g>
        <g>
          <defs>
            <path id="SVGID_17_" d="M95.752,15.413v14.762c0,7.606-19.228,13.777-42.946,13.777c-23.713,0-42.94-6.17-42.94-13.777V15.413     c0,7.608,19.229,13.776,42.94,13.776C76.524,29.19,95.752,23.022,95.752,15.413z" />
          </defs>
          <clipPath id="SVGID_18_">
            <use xlinkHref="#SVGID_17_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_18_)" fill="inherit" d="M95.752,15.413v14.762c0,0.773-0.198,1.534-0.58,2.275V17.684   C95.554,16.947,95.752,16.188,95.752,15.413" />
        </g>
        <g>
          <defs>
            <path id="SVGID_19_" d="M95.752,15.413v14.762c0,7.606-19.228,13.777-42.946,13.777c-23.713,0-42.94-6.17-42.94-13.777V15.413     c0,7.608,19.229,13.776,42.94,13.776C76.524,29.19,95.752,23.022,95.752,15.413z" />
          </defs>
          <clipPath id="SVGID_20_">
            <use xlinkHref="#SVGID_19_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_20_)" fill="inherit" d="M95.172,17.684v14.767c-0.317,0.601-0.751,1.191-1.296,1.763V19.453   C94.421,18.88,94.854,18.29,95.172,17.684" />
        </g>
        <g>
          <defs>
            <path id="SVGID_21_" d="M95.752,15.413v14.762c0,7.606-19.228,13.777-42.946,13.777c-23.713,0-42.94-6.17-42.94-13.777V15.413     c0,7.608,19.229,13.776,42.94,13.776C76.524,29.19,95.752,23.022,95.752,15.413z" />
          </defs>
          <clipPath id="SVGID_22_">
            <use xlinkHref="#SVGID_21_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_22_)" fill="inherit" d="M93.876,19.453v14.76c-0.8,0.834-1.832,1.636-3.083,2.393V21.84   C92.044,21.083,93.076,20.286,93.876,19.453" />
        </g>
        <g>
          <defs>
            <path id="SVGID_23_" d="M95.752,15.413v14.762c0,7.606-19.228,13.777-42.946,13.777c-23.713,0-42.94-6.17-42.94-13.777V15.413     c0,7.608,19.229,13.776,42.94,13.776C76.524,29.19,95.752,23.022,95.752,15.413z" />
          </defs>
          <clipPath id="SVGID_24_">
            <use xlinkHref="#SVGID_23_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_24_)" fill="inherit" d="M90.793,21.84v14.766c-7.196,4.366-21.506,7.346-37.987,7.346   c-23.713,0-42.94-6.169-42.94-13.776V15.413c0,7.608,19.229,13.776,42.94,13.776C69.287,29.19,83.597,26.212,90.793,21.84" />
        </g>
      </g>
    </g>);
  }
  renderBoth() {
    return (<g>
      <g>
        <g>
          <g>
            <path fill="inherit" d="M27.212,76.199C9.537,76.199,0,71.179,0,66.456c0-1.425,0.785-3.537,4.521-5.522l0.954,1.796     c-2.219,1.179-3.44,2.502-3.44,3.727c0,3.646,10.34,7.709,25.178,7.709c14.84,0,25.181-4.063,25.181-7.709     c0-1.269-1.27-2.371-2.336-3.074l1.119-1.697c2.158,1.421,3.251,3.026,3.251,4.771C54.427,71.179,44.889,76.199,27.212,76.199z" />
          </g>
          <g>
            <path fill="none" stroke="inherit" strokeWidth="2" strokeMiterlimit="10" d="M27.212,57.737" />
          </g>
        </g>
        <g>
          <defs>
            <path id="SVGID_25_" d="M54.436,66.43v9.423c0,4.85-12.182,8.792-27.211,8.792c-15.025,0-27.204-3.942-27.204-8.792V66.43     c0,4.856,12.179,8.792,27.204,8.792C42.254,75.222,54.436,71.286,54.436,66.43z" />
          </defs> <use xlinkHref="#SVGID_25_" overflow="visible" fill="inherit" /> <clipPath id="SVGID_2_">
            <use xlinkHref="#SVGID_25_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_2_)" fill="inherit" d="M54.436,66.43v9.423c0,0.496-0.127,0.979-0.372,1.449v-9.423   C54.309,67.405,54.436,66.923,54.436,66.43" /> <path clipPath="url(#SVGID_2_)" fill="inherit" d="M54.063,67.879v9.423c-0.195,0.385-0.473,0.761-0.819,1.126v-9.42   C53.591,68.638,53.868,68.264,54.063,67.879" /> <path clipPath="url(#SVGID_2_)" fill="inherit" d="M53.244,69.008v9.42c-0.504,0.532-1.158,1.04-1.945,1.527v-9.423   C52.086,70.047,52.74,69.539,53.244,69.008" /> <path clipPath="url(#SVGID_2_)" fill="inherit" d="M51.299,70.532v9.423c-4.563,2.787-13.629,4.689-24.074,4.689   c-15.025,0-27.204-3.942-27.204-8.792V66.43c0,4.856,12.179,8.792,27.204,8.792C37.67,75.222,46.735,73.321,51.299,70.532" />
        </g>
        <g>
          <g>
            <path fill="inherit" d="M27.211,62.753C9.537,62.753,0,57.734,0,53.01c0-1.697,1.094-4.179,6.299-6.359l0.786,1.875     c-3.21,1.346-5.051,2.979-5.051,4.484c0,3.646,10.34,7.711,25.177,7.711c14.84,0,25.182-4.065,25.182-7.711     c0-0.856-0.568-1.735-1.691-2.612l1.254-1.603c1.64,1.281,2.472,2.7,2.472,4.215C54.427,57.734,44.888,62.753,27.211,62.753z" />
          </g>
        </g>
        <g>
          <defs>
            <path id="SVGID_27_" d="M54.436,52.896v9.423c0,4.854-12.182,8.793-27.211,8.793c-15.025,0-27.204-3.938-27.204-8.793v-9.423     c0,4.855,12.179,8.796,27.204,8.796C42.254,61.692,54.436,57.752,54.436,52.896z" />
          </defs>
          <use xlinkHref="#SVGID_27_" overflow="visible" fill="inherit" />
          <clipPath id="SVGID_4_">
            <use xlinkHref="#SVGID_27_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_4_)" fill="inherit" d="M54.436,52.896v9.423c0,0.492-0.127,0.979-0.372,1.447v-9.421   C54.309,53.874,54.436,53.393,54.436,52.896" /> <path clipPath="url(#SVGID_4_)" fill="inherit" d="M54.063,54.346v9.421c-0.195,0.388-0.473,0.764-0.819,1.13v-9.422   C53.591,55.109,53.868,54.729,54.063,54.346" /> <path clipPath="url(#SVGID_4_)" fill="inherit" d="M53.244,55.475v9.422c-0.504,0.531-1.158,1.044-1.945,1.529v-9.427   C52.086,56.518,52.74,56.006,53.244,55.475" /> <path clipPath="url(#SVGID_4_)" fill="inherit" d="M51.299,56.999v9.427c-4.563,2.787-13.629,4.687-24.074,4.687   c-15.025,0-27.204-3.938-27.204-8.793v-9.423c0,4.855,12.179,8.796,27.204,8.796C37.67,61.692,46.735,59.787,51.299,56.999" />
        </g>
        <g>
          <g>
            <path fill="inherit" d="M33.429,50.562c-17.684,0-27.226-5.021-27.226-9.744c0-4.719,9.542-9.735,27.226-9.735     s27.227,5.017,27.227,9.735C60.655,45.542,51.112,50.562,33.429,50.562z M33.429,33.118c-14.846,0-25.19,4.058-25.19,7.7     c0,3.647,10.345,7.71,25.19,7.71c14.848,0,25.193-4.062,25.193-7.71C58.622,37.176,48.276,33.118,33.429,33.118z" />
          </g>
        </g>
        <g>
          <defs>
            <path id="SVGID_29_" d="M60.655,40.818v9.351c0,4.819-12.179,8.727-27.205,8.727c-15.021,0-27.201-3.907-27.201-8.727v-9.351     c0,4.82,12.181,8.728,27.201,8.728C48.477,49.546,60.655,45.639,60.655,40.818z" />
          </defs>
          <use xlinkHref="#SVGID_29_" overflow="visible" fill="inherit" />
          <clipPath id="SVGID_6_">
            <use xlinkHref="#SVGID_29_" overflow="visible" />
          </clipPath>
          <path clipPath="url(#SVGID_6_)" fill="inherit" d="M60.655,40.818v9.351c0,0.491-0.127,0.973-0.366,1.442v-9.354   C60.528,41.79,60.655,41.31,60.655,40.818" /> <path clipPath="url(#SVGID_6_)" fill="inherit" d="M60.289,42.257v9.354c-0.201,0.379-0.477,0.754-0.82,1.116v-9.351   C59.812,43.014,60.088,42.641,60.289,42.257" /> <path clipPath="url(#SVGID_6_)" fill="inherit" d="M59.469,43.377v9.351c-0.506,0.527-1.16,1.034-1.953,1.515v-9.354   C58.309,44.41,58.963,43.905,59.469,43.377" /> <path clipPath="url(#SVGID_6_)" fill="inherit" d="M57.516,44.889v9.354c-4.559,2.766-13.625,4.653-24.065,4.653   c-15.021,0-27.201-3.907-27.201-8.727v-9.351c0,4.82,12.181,8.728,27.201,8.728C43.891,49.546,52.957,47.657,57.516,44.889" />
        </g>
      </g>
      <rect x="78.703" y="41.812" fill="inherit" width="31.322" height="3.1" />
      <rect x="87.141" y="47.842" fill="inherit" width="22.763" height="3.1" />
      <path fill="#E6E6E6" stroke="inherit" strokeWidth="2" strokeMiterlimit="10" d="M27.237,57.689" />
      <g>
        <path fill="none" d="M44.984,66.104h67.287c2.909,0,5.275-2.366,5.275-5.274V32.68h-95.11v10.683h22.548V66.104z" />
        <path fill="none" d="M112.271,6.328H27.711c-2.909,0-5.274,2.366-5.274,5.275v4.854h95.11v-4.854 C117.547,8.694,115.181,6.328,112.271,6.328z" />
        <path fill="inherit" d="M112.271,0H27.711c-6.398,0-11.604,5.206-11.604,11.604v21.571h6.33V32.68h95.11v28.15 c0,2.908-2.366,5.274-5.275,5.274H54.38v6.329h57.892c6.397,0,11.604-5.206,11.604-11.604V11.604 C123.875,5.206,118.669,0,112.271,0z M117.547,16.457h-95.11v-4.854c0-2.909,2.365-5.275,5.274-5.275h84.561 c2.909,0,5.275,2.366,5.275,5.275V16.457z" />
      </g>
    </g>);
  }
  render() {
    const { cash, card } = this.props;
    const [width, height] = card ? (cash ? [123.875, 84.645] : [137.35, 84.792]) : [95.752, 84.645]; // eslint-disable-line no-nested-ternary
    let render = this.renderBoth;
    if (!card) render = this.renderCash;
    if (!cash) render = this.renderCard;
    return (<svg version="1.1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {render()}
    </svg>);
  }
}
