---
title: "Connections, curvature & holonomy"
description: "Parallel transport around small loops and its relation to curvature."
date: 2026-06-13
weight: 20
chapter: 2
status: budding
tags: [connections, holonomy, gauge theory]
---

The connection is the rule for comparing vectors at neighbouring points; its curvature is the obstruction to comparing them *globally*. This chapter assembles the whole apparatus — equations, a definition, a theorem, a proof, and a short Julia experiment — around one classical fact: **parallel transport around a loop remembers the curvature it enclosed.**

## Cartan's structure equations

Fix an orthonormal coframe $\theta^{a}$ and let $\omega^{a}{}_{b}$ be the connection one-form. The torsion and curvature two-forms are defined by

$$
\begin{equation}
\mathrm{d}\theta^{a} + \omega^{a}{}_{b}\wedge\theta^{b} = T^{a}, \label{eq:torsion}
\end{equation}
$$

$$
\begin{equation}
\mathrm{d}\omega^{a}{}_{b} + \omega^{a}{}_{c}\wedge\omega^{c}{}_{b} = \Omega^{a}{}_{b}. \label{eq:curv}
\end{equation}
$$

Equation \eqref{eq:torsion} says the torsion is the failure of the coframe to close; \eqref{eq:curv} packages the curvature as the field strength of $\omega$.^[Read $\omega$ as a gauge potential and $\Omega$ as its $F = \mathrm{d}A + A\wedge A$ — the analogy is exact for a principal connection, and it is the bridge to the gauge-theoretic picture below.]

> [!definition] Parallel transport {#def:pt}
> A vector field $V^{a}$ is *parallel-transported* along a curve with tangent $u^{\mu}$ when its covariant derivative along the curve vanishes, $u^{\mu}\nabla_{\mu}V^{a} = 0$.

## The holonomy of a small loop

> [!theorem] Holonomy–curvature {#thm:hol}
> Transporting $V^{a}$ around a closed loop spanning the infinitesimal bivector $u^{\mu}v^{\nu}\,\delta s\,\delta t$ returns it changed by
> $$
> \begin{equation}
> \delta V^{a} = -\,R^{a}{}_{b\mu\nu}\,V^{b}\,u^{\mu}v^{\nu}\,\delta s\,\delta t \;+\; \mathcal{O}(\delta^{3}). \label{eq:hol}
> \end{equation}
> $$
> The leading deficit is exactly the curvature of \eqref{eq:curv}.

> [!proof]
> Write the transport as the path-ordered exponential $\mathcal{P}\exp\!\big(\!-\!\oint \omega\big)$. Expanding to second order, the first-order term integrates to zero around a closed loop, and Stokes' theorem turns the second-order term into the surface integral of $\mathrm{d}\omega + \omega\wedge\omega = \Omega$. Reading off components gives \eqref{eq:hol}.

So [](#def:pt) is all it takes to *define* holonomy, and [](#thm:hol) says what it measures.

## A sphere you can check

On the unit sphere the curvature integrates to area, so transport around a circle of colatitude $\theta$ rotates a vector by the enclosed solid angle:

$$
\begin{equation}
\Delta\varphi \;=\; \iint_{\Sigma}\Omega \;=\; 2\pi\,(1-\cos\theta). \label{eq:solid}
\end{equation}
$$

> [!example] Numerical transport
> The spin connection for the adapted frame $\{e_{\theta}, e_{\varphi}\}$ rotates the frame by $-\cos\theta\,\mathrm{d}\varphi$ at each step. Composing one full lap should reproduce \eqref{eq:solid} — modulo $2\pi$, which is the price of the chart's singularity at the pole.^[That stray $2\pi$ is the Foucault pendulum: the swing plane is parallel-transported, and what you measure against the ground differs from the bare holonomy by exactly one winding.]

```julia
using LinearAlgebra

# Parallel transport of a tangent vector once around the circle of
# colatitude θ on the unit sphere, integrated as a rotation in φ.
# Expect a net turn equal to the enclosed solid angle, 2π(1 - cos θ).
function holonomy_angle(θ; n = 20_000)
    dφ = 2π / n
    α  = -cos(θ) * dφ                      # the frame rotates by -cosθ dφ per step
    R  = [cos(α) -sin(α); sin(α) cos(α)]   # one infinitesimal rotation
    v  = R^n * [1.0, 0.0]                  # compose n steps around the loop
    return mod2pi(atan(v[2], v[1]))        # net rotation, in [0, 2π)
end

θ = π/3
@show holonomy_angle(θ)         # ≈ 3.14159…
@show 2π * (1 - cos(θ))         # = π, the enclosed solid angle  (cos π/3 = 1/2)
```

> [!remark]
> That same path-ordered exponential, with $\omega$ a non-abelian gauge field, is the Wilson loop; and its phase, for a spin carried through a gravitational field, is the geometric phase that neutron interferometry sets out to measure. The bookkeeping on this page is the whole idea — only the group changes.
