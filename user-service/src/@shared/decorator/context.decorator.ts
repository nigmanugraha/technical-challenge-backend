import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserAgent } from '../dto/common.dto';

export const Context = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserAgent => {
    const request = ctx.switchToHttp().getRequest<Request>();

    // Extract user-agent and IP address
    const userAgent = request.headers['user-agent'];
    const ipAddress = request.ip || request.connection.remoteAddress;

    // Extract HTTP method and endpoint (URL)
    const method = request.method;
    const endpoint = request.originalUrl;

    // Extract User
    const user = (request as any).user || null;

    // Optionally, you can also extract request parameters, query, headers, and body
    const requestParams = request.params;
    const requestBody = request.body;
    const requestQuery = request.query;
    const requestHeaders = request.headers;

    // Extract device info based on the user-agent
    const deviceType = extractDeviceType(userAgent); // Function to detection for mobile vs desktop
    const os = extractOperatingSystem(userAgent); // Function to extract OS from user-agent
    const browser = extractBrowser(userAgent); // Function to extract browser from user-agent
    const brandModel = extractBrandAndModel(userAgent); // Function to extract brand and model from user-agent
    const device = extractDevice(userAgent); // Function to extract device from user-agent

    return {
      method,
      endpoint,
      userAgent,
      ipAddress,
      user,
      requestHeaders,
      requestParams,
      requestBody,
      requestQuery,
      device_info: {
        deviceType,
        os,
        browser,
        brandModel,
        device,
      },
    };
  },
);

// Helper function to extract Operating System from user-agent
function extractOperatingSystem(userAgent: string): string {
  if (userAgent.includes('Windows NT 10.0')) return 'Windows 10';
  if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
  if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
  if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
  if (userAgent.includes('Windows NT 5.1')) return 'Windows XP';
  if (userAgent.includes('Mac OS X')) return 'Mac OS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone')) return 'iOS';
  if (userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
}

// Helper function to extract Browser and its version from user-agent
function extractBrowser(userAgent: string): string {
  const browserRegex =
    /(Chrome|Firefox|Safari|MSIE|Trident|Edge|Opera)[\/\s]([0-9\.]+)/;
  const match = userAgent.match(browserRegex);
  if (match) {
    const [browser, version] = [match[1], match[2]];
    if (browser === 'Trident') return `Internet Explorer ${version}`; // For IE
    return `${browser} ${version}`;
  }

  return 'Unknown';
}

// Helper function to extract device type (Mobile or Desktop) from user-agent
function extractDeviceType(userAgent: string): string {
  if (userAgent.includes('Mobi')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  return 'Desktop';
}

// Helper function to extract Brand and Model from user-agent
function extractBrandAndModel(userAgent: string): string {
  const brandModelRegex = /\(([^;]+); ([^;]+); ([^)]+)\)/;
  const match = userAgent.match(brandModelRegex);
  if (match) {
    const brand = match[3];
    return brand;
  }
  return 'Unknown';
}

// Helper function to extract Device (if present)
function extractDevice(userAgent: string): string {
  const deviceRegex = /(\w+)\s(Build|)\s[\w\d]+\s\(/;
  const match = userAgent.match(deviceRegex);
  if (match) {
    return match[1];
  }
  return 'Unknown Device';
}
