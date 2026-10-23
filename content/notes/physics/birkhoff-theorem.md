---
title: "A note on Birkhoff's theorem"
description: "Spherically symmetric vacuum solutions are static; consequences for gravitational collapse."
date: 2025-12-22
status: evergreen
tags: [general relativity, spherical symmetry, vacuum solutions]
---

Birkhoff's theorem is one of the most elegant results in classical general relativity. It asserts that the geometry outside any spherically symmetric matter distribution is uniquely fixed — regardless of whether the source is static, pulsating, or collapsing.

## Statement

> [!theorem] Birkhoff {#thm:birkhoff}
> Every spherically symmetric solution of the vacuum Einstein equations $G_{\mu\nu} = 0$ is locally isometric to the Schwarzschild spacetime.

In other words, the exterior metric is

$$
\mathrm{d}s^2 = -\left(1 - \frac{2m}{r}\right)\mathrm{d}t^2 + \left(1 - \frac{2m}{r}\right)^{-1}\mathrm{d}r^2 + r^2\, \mathrm{d}\Omega^2
$$

for some mass parameter $m \geq 0$.^[Strictly, "locally isometric to a region of the maximally extended Schwarzschild spacetime" — inside the horizon the Killing field $\partial_t$ is spacelike, so the solution is *homogeneous* rather than static there.]

## Proof sketch

Write the most general spherically symmetric metric as

$$
\begin{equation}
\mathrm{d}s^2 = -e^{2\alpha(t,r)}\,\mathrm{d}t^2 + e^{2\beta(t,r)}\,\mathrm{d}r^2 + r^2\, \mathrm{d}\Omega^2, \label{eq:ansatz}
\end{equation}
$$

with $\alpha, \beta$ smooth functions to be determined. The vacuum equations $R_{\mu\nu} = 0$ reduce to a coupled PDE system. The $(t,r)$ component gives $\partial_t \beta = 0$, so $\beta = \beta(r)$. The $(r,r)$ and $(t,t)$ components then force $\partial_t\alpha$ to depend on $t$ alone, which a redefinition of $t$ removes — establishing **staticity**. What remains integrates to Schwarzschild.

> [!remark]
> No time-independence is assumed at the outset: staticity is a *consequence* of spherical symmetry and the vacuum equations, as stated in [](#thm:birkhoff).

## Corollaries

**No monopole radiation.** A radially pulsating star produces no gravitational waves: the exterior is Schwarzschild at all times, hence static.

**Collapse.** For a collapsing shell of dust, the exterior is already Schwarzschild before the shell crosses $r = 2m$; the event horizon forms there independently of the interior dynamics.

> [!corollary] The case $m = 0$
> A spherically symmetric vacuum spacetime with $m = 0$ is (a region of) Minkowski space — the relativistic analogue of Newton's shell theorem.

## References

The classic sources are {{< cite "birkhoff1923" >}}, {{< cite "wald1984" "§6.1" >}} and {{< cite "hawkingellis1973" "§5" >}}.
