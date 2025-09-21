"use client";

import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface Node {
  id: string;
  label: string;
  type: "CWE" | "CVE" | "CODE_EXAMPLE";
  properties: Record<string, any>;
  size: number;
  color: string;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  type: string;
  weight: number;
  label: string;
}

export interface GraphData {
  nodes: Node[];
  edges: Edge[];
  metadata: {
    center_node: string;
    query_type: string;
    total_nodes: number;
    total_edges: number;
  };
}

interface GraphVisualizationProps {
  data: GraphData;
  width?: number;
  height?: number;
}

export function GraphVisualization({
  data,
  width = 800,
  height = 600,
}: GraphVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data?.nodes?.length) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create container group for zoom/pan
    const container = svg.append("g");

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Function to get better colors based on node type
    const getNodeColor = (node: Node) => {
      switch (node.type) {
        case "CWE":
          return "#ef4444"; // Red-500
        case "CVE":
          return "#22c55e"; // Green-500
        case "CODE_EXAMPLE":
          return "#f59e0b"; // Amber-500
        default:
          return "#6b7280"; // Gray-500
      }
    };

    // Function to get node label (ID only)
    const getNodeLabel = (node: Node) => {
      if (node.type === "CODE_EXAMPLE") {
        // Extract just the code example ID part
        const match = node.id.match(/_code_example_(\d+)$/);
        return match ? `Code ${match[1]}` : node.id;
      }
      return node.id;
    };

    // Process data - ensure nodes have proper numeric values and better sizing
    const processedNodes = data.nodes.map((node) => ({
      ...node,
      size: Math.max(
        typeof node.size === "object" &&
          node.size &&
          typeof node.size === "object" &&
          "$numberInt" in node.size
          ? parseInt((node.size as any).$numberInt || "25")
          : typeof node.size === "number"
          ? node.size
          : 25,
        55 // Increased minimum size to fit longer CVE IDs
      ),
      color: getNodeColor(node), // Override backend colors
      displayLabel: getNodeLabel(node),
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    const processedEdges = data.edges.map((edge) => ({
      ...edge,
      weight:
        typeof edge.weight === "object" &&
        edge.weight &&
        "$numberInt" in edge.weight
          ? parseInt((edge.weight as any).$numberInt || "1")
          : typeof edge.weight === "number"
          ? edge.weight
          : 1,
    }));

    // Create force simulation with better spacing for larger nodes
    const simulation = d3
      .forceSimulation(processedNodes)
      .force(
        "link",
        d3
          .forceLink(processedEdges)
          .id((d: any) => d.id)
          .distance(250) // Further increased distance for larger nodes
          .strength(0.3)
      )
      .force("charge", d3.forceManyBody().strength(-1500)) // Even stronger repulsion
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide().radius((d: any) => d.size + 25) // More spacing for larger nodes
      );

    // Create arrow markers for directed edges
    const defs = container.append("defs");

    defs
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -6 10 12")
      .attr("refX", 10) // Position arrow at the end of the line
      .attr("refY", 0)
      .attr("markerWidth", 8) // Adjust size
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .attr("markerUnits", "strokeWidth")
      .append("path")
      .attr("d", "M0,-6L10,0L0,6") // Triangle arrow shape
      .attr("fill", "#374151") // Darker color for better visibility
      .attr("stroke", "none");

    // Create links with proper arrow positioning
    const links = container
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(processedEdges)
      .enter()
      .append("line")
      .attr("stroke", "#6b7280") // Darker gray for better visibility
      .attr("stroke-width", 3) // Thicker lines
      .attr("stroke-opacity", 0.8) // More opaque
      .attr("marker-end", "url(#arrowhead)");

    // Create link labels
    const linkLabels = container
      .append("g")
      .attr("class", "link-labels")
      .selectAll("text")
      .data(processedEdges)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("font-size", "12px") // Increased font size for better readability
      .attr(
        "font-family",
        "'Inter', 'SF Pro Display', -apple-system, sans-serif"
      )
      .attr("font-weight", "500")
      .attr("fill", "#4b5563") // Slightly darker gray for better contrast
      .attr("stroke", "#fff")
      .attr("stroke-width", "0.5")
      .text((d) => d.type);

    // Create nodes
    const nodes = container
      .append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(processedNodes)
      .enter()
      .append("circle")
      .attr("r", (d) => d.size)
      .attr("fill", (d) => d.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .style("cursor", "pointer")
      .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))")
      .call(
        d3
          .drag<SVGCircleElement, any>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Add node labels
    const nodeLabels = container
      .append("g")
      .attr("class", "node-labels")
      .selectAll("text")
      .data(processedNodes)
      .enter()
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", "12px") // Increased font size for larger nodes
      .attr(
        "font-family",
        "'Inter', 'SF Pro Display', -apple-system, sans-serif"
      )
      .attr("font-weight", "600")
      .attr("fill", "#fff")
      .attr("pointer-events", "none")
      .style("text-shadow", "0 1px 2px rgba(0,0,0,0.3)")
      .text((d: any) => d.displayLabel);

    // Add tooltips
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "graph-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(17, 24, 39, 0.95)")
      .style("color", "white")
      .style("padding", "12px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("max-width", "300px")
      .style("border", "1px solid rgba(75, 85, 99, 0.3)")
      .style("backdrop-filter", "blur(8px)");

    nodes
      .on("mouseover", function (event, d: any) {
        const tooltipContent = `
          <div class="font-semibold text-white mb-2">${d.label}</div>
          <div class="text-gray-200 text-sm mb-1">ID: ${d.id}</div>
          <div class="text-gray-200 text-sm mb-2">Type: ${d.type}</div>
          ${
            d.properties.description
              ? `<div class="text-gray-300 text-xs leading-relaxed">${
                  d.properties.description.length > 150
                    ? d.properties.description.substring(0, 150) + "..."
                    : d.properties.description
                }</div>`
              : ""
          }
          ${
            d.properties.related_cwe
              ? `<div class="text-blue-300 text-xs mt-2">Related CWE: ${d.properties.related_cwe}</div>`
              : ""
          }
          ${
            d.properties.related_cve
              ? `<div class="text-green-300 text-xs mt-1">Related CVE: ${d.properties.related_cve}</div>`
              : ""
          }
        `;

        tooltip.style("visibility", "visible").html(tooltipContent);
        d3.select(this)
          .attr("stroke-width", 5)
          .style("filter", "drop-shadow(0 4px 8px rgba(0,0,0,0.3))");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this)
          .attr("stroke-width", 3)
          .style("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.1))");
      });

    // Update positions on simulation tick
    simulation.on("tick", () => {
      // Calculate link positions so arrows don't overlap with nodes
      links
        .attr("x1", (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          // Add padding to the node radius to ensure arrows are visible
          const sourceRadius = d.source.size + 5;
          return d.source.x + (dx * sourceRadius) / dr;
        })
        .attr("y1", (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          const sourceRadius = d.source.size + 5;
          return d.source.y + (dy * sourceRadius) / dr;
        })
        .attr("x2", (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          // Add padding to leave space for the arrow
          const targetRadius = d.target.size + 15;
          return d.target.x - (dx * targetRadius) / dr;
        })
        .attr("y2", (d: any) => {
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const dr = Math.sqrt(dx * dx + dy * dy);
          const targetRadius = d.target.size + 15;
          return d.target.y - (dy * targetRadius) / dr;
        });

      linkLabels
        .attr("x", (d: any) => (d.source.x + d.target.x) / 2)
        .attr("y", (d: any) => (d.source.y + d.target.y) / 2);

      nodes.attr("cx", (d: any) => d.x).attr("cy", (d: any) => d.y);

      nodeLabels.attr("x", (d: any) => d.x).attr("y", (d: any) => d.y);
    });

    // Cleanup function
    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [data, width, height]);

  if (!data?.nodes?.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No graph data available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-sm">
        <div className="text-sm font-medium text-gray-900">
          Graph Visualization
        </div>
        <div className="text-xs text-gray-600">
          {data.metadata.total_nodes} nodes, {data.metadata.total_edges} edges
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Center: {data.metadata.center_node}
        </div>
      </div>
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white bg-opacity-90 px-3 py-2 rounded-md shadow-sm">
          <div className="text-xs font-medium text-gray-700 mb-2">Legend</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-gray-600">CWE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-gray-600">CVE</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-gray-600">Code Example</span>
            </div>
          </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}
