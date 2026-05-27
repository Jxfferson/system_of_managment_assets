from fastapi import APIRouter, HTTPException

try:
    import serial.tools.list_ports
except Exception:  # pragma: no cover
    serial = None


router = APIRouter(prefix="/api/scanner", tags=["scanner"])


@router.get("/ports")
def list_serial_ports():
    if serial is None:
        raise HTTPException(status_code=503, detail="pyserial is not installed on the server")

    ports = serial.tools.list_ports.comports()
    return [
        {
            "device": port.device,
            "description": port.description or "Unknown device",
            "hwid": port.hwid or "",
            "vid": port.vid,
            "pid": port.pid,
            "serial_number": port.serial_number,
            "manufacturer": port.manufacturer,
            "product": port.product,
            "interface": port.interface,
        }
        for port in ports
    ]